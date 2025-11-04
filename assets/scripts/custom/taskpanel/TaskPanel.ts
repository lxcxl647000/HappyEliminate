import { _decorator, Animation, Color, EventTouch, instantiate, Label, Node, UITransform } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from "../../framework/lib/router/PanelComponent";
import { qc } from "../../framework/qc";
import { PanelConfigs } from "../../configs/PanelConfigs";
import CustomSprite from '../componetUtils/CustomSprite';
import { taskItems } from '../../commonTs/taskItem';
import { renwuMgr } from '../../manager/TaskMgr';
import CommonTipsMgr from '../../manager/CommonTipsMgr';
import GetItemMgr from '../../manager/GetItemMgr';
import PlayerMgr from '../../manager/PlayerMgr';
import EventDef from '../../constants/EventDef';
import ListCom from '../../framework/lib/components/scrollviewplus/ListCom';
import { ItemType } from '../../configs/ItemConfig';

const { ccclass, property } = _decorator;

@ccclass('TaskPanel')
export class TaskPanel extends PanelComponent {
    @property(Node)
    animation: Node = null;
    @property(ListCom)
    list: ListCom = null;
    @property(Node)
    stageNode: Node = null;
    @property(Node)
    stageNodeParent: Node = null;
    @property(Node)
    progressBarNode: Node = null;
    @property(Node)
    noDtaNode: Node = null;
    private taskRewardState: any = {};

    // 阶段性奖励
    private async getRewardStages() {
        renwuMgr.ins.getTaskRewardStages(res => {
            this.stageNodeParent.destroyAllChildren();
            this.taskRewardState = res;

            for (let i = 0; i < this.taskRewardState.list.length; i++) {
                let itemNode = instantiate(this.stageNode);
                itemNode.active = true;
                this.stageNodeParent.addChild(itemNode);

                if (i === 0 || i === 2 || i === 4) {
                    let checkNotDisplayRedPack = qc.platform.checkNotDisplayRedPack();
                    if (this.taskRewardState.list[i].claimed === 2) { // 已领取
                        itemNode.getComponent(Animation).stop();
                        itemNode.getComponentInChildren(CustomSprite).index = checkNotDisplayRedPack ? 3 : 2;
                    }
                    else if (this.taskRewardState.list[i].claimed === 1) {
                        itemNode.getComponent(Animation).play();
                        itemNode.getComponentInChildren(CustomSprite).index = checkNotDisplayRedPack ? 1 : 0;
                    }
                    else {
                        itemNode.getComponentInChildren(CustomSprite).index = checkNotDisplayRedPack ? 1 : 0;
                    }
                }
                if (i === 1 || i === 3) {
                    if (this.taskRewardState.list[i].claimed === 2) { // 已领取
                        itemNode.getComponent(Animation).stop();
                        itemNode.getComponentInChildren(CustomSprite).index = 3;

                    }
                    else if (this.taskRewardState.list[i].claimed === 1) {
                        itemNode.getComponent(Animation).play();
                        itemNode.getComponentInChildren(CustomSprite).index = 1;
                    }
                    else {
                        itemNode.getComponentInChildren(CustomSprite).index = 1;
                    }
                }

                let stage = itemNode.getChildByName('stage');
                stage['item'] = this.taskRewardState.list[i];
                if (this.taskRewardState.list[i].claimed === 2) { // 已领取
                    itemNode.getChildByName('completeIcon').active = true;
                    itemNode.getComponentInChildren(Label).string = '已完成';
                    itemNode.getComponentInChildren(Label).color = new Color(187, 147, 110, 255);
                } else {
                    itemNode.getComponentInChildren(Label).string = `完成${this.taskRewardState.list[i].stage}次`;
                }
            }
            // 进度条显示
            const stages = this.taskRewardState.list.map((item) => item.stage)
            // let width = 442;
            const firstLen = 16;
            const lastLen = 16;
            const middleLen = 416;
            const totalWidth = firstLen + middleLen + lastLen;
            const middleStageCount = 4; // 1~3, 3~8, 8~15, 15~20
            const middleStep = middleLen / middleStageCount; // 100
            const taskNum = this.taskRewardState.taskNum;
            let width = 0;
            if (taskNum <= stages[0]) {
                // 0~1，未到第一个节点
                width = (taskNum / stages[0]) * firstLen;
            } else if (taskNum <= stages[1]) {
                // 1~3，第一段
                const percent = (taskNum - stages[0]) / (stages[1] - stages[0]);
                width = firstLen + percent * middleStep;
            } else if (taskNum <= stages[2]) {
                // 3~8，第二段
                const percent = (taskNum - stages[1]) / (stages[2] - stages[1]);
                width = firstLen + middleStep + percent * middleStep;
            } else if (taskNum <= stages[3]) {
                // 8~15，第三段
                const percent = (taskNum - stages[2]) / (stages[3] - stages[2]);
                width = firstLen + middleStep * 2 + percent * middleStep;
            } else if (taskNum <= stages[4]) {
                // 15~20，第四段
                const percent = (taskNum - stages[3]) / (stages[4] - stages[3]);
                width = firstLen + middleStep * 3 + percent * middleStep;
            } else {
                // 超过20，最后一段
                width = totalWidth;
            }
            width = Math.max(0, Math.min(width, totalWidth));
            this.progressBarNode.getComponent(UITransform).width = width;
        });
    }

    // 领取阶段性奖励
    private clickStageReward(e: EventTouch) {
        let node = e.currentTarget;
        let stage = node['item'];
        if (stage.claimed == 2) {
            return;
        }
        renwuMgr.ins.claimStageReward(stage.stage, res => {
            this.getRewardStages();
            const count = parseFloat(res.desc);
            if (res.type == 1) { // 红包
                PlayerMgr.ins.addCash(count);
                GetItemMgr.ins.showGetItem(ItemType.RedPack, count);
            } else {
                // 金币
                PlayerMgr.ins.addGold(count);
                GetItemMgr.ins.showGetItem(ItemType.Gold, count);
            }
        });
    }

    init() {
        this.getRewardStages();
        renwuMgr.ins.getTaskList(() => {
            this._initRenwu();
        });
    }

    private _onShowPage(isSuccess?: boolean) {
        if (renwuMgr.ins.jumpTask) {
            // @ts-ignore
            let readTimeBool = (new Date() - renwuMgr.ins.recordTime) / 1000 < renwuMgr.ins.jumpTask.browse_time;
            let flag = false;
            if (renwuMgr.ins.jumpTask.task_type == '12') { // 激励广告
                if (!isSuccess) {
                    CommonTipsMgr.ins.showTips('未完成广告任务');
                }
                else {
                    flag = true;
                }

            } else if (renwuMgr.ins.jumpTask.task_type == '8') {
                if (readTimeBool) {
                    CommonTipsMgr.ins.showTips(`访问${renwuMgr.ins.jumpTask.browse_time}秒以上,才能领取奖励哦`);
                    renwuMgr.ins.recordTime = null;
                }
                else {
                    flag = true;
                }
            }
            if (flag) {
                renwuMgr.ins.completeTask(renwuMgr.ins.jumpTask, (res) => {
                    if (res.task === 2) {
                        if (res.award_type === '1') {
                            PlayerMgr.ins.addCash(+res.award);
                            GetItemMgr.ins.showGetItem(ItemType.RedPack, +res.award);
                        } else {
                            PlayerMgr.ins.addGold(+res.award);
                            GetItemMgr.ins.showGetItem(ItemType.Gold, +res.award);
                        }
                        this._updateList();
                    }
                });
            }

            renwuMgr.ins.jumpTask = null;
        }
    }


    private _initRenwu() {
        this.noDtaNode.active = renwuMgr.ins.taskList.length === 0;
        this.list.numItems = renwuMgr.ins.taskList.length === 0 ? 0 : renwuMgr.ins.taskList.length;
    }

    private _updateList() {
        renwuMgr.ins.getTaskList(() => {
            this.list.numItems = 0;
            this._initRenwu();
        });
        this.getRewardStages();
    }

    onRenderRenwuItem(item: Node, index: number) {
        item.active = true;
        let taskItem = item.getComponent(taskItems);
        if (taskItem) {
            taskItem.setData(renwuMgr.ins.taskList[index]);
        }
    }

    protected onEnable(): void {
        qc.eventManager.on(EventDef.Update_TaskList, this._updateList, this);
        qc.eventManager.on(EventDef.OnShow, this._onshow, this);
        qc.eventManager.on(EventDef.TaskCompleted, this._taskCompleted, this);
        this.init();
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.Update_TaskList, this._updateList, this);
        qc.eventManager.off(EventDef.OnShow, this._onshow, this);
        qc.eventManager.off(EventDef.TaskCompleted, this._taskCompleted, this);

    }

    show(option: PanelShowOption): void {
        option.onShowed();
        this.animation.getComponent(Animation).play();
    }

    hide(option: PanelHideOption): void {
        option.onHided();
    }

    // 关闭弹框
    handleClosePop() {
        qc.panelRouter.hide({
            panel: PanelConfigs.taskPanel
        })
    }

    _onshow(res) {
        if (renwuMgr.ins.jumpTask.task_type == '8') {
            this._onShowPage();
        }
        // this.init();

    }

    private _taskCompleted(isSuccess?: boolean) {
        this._onShowPage(isSuccess);
    }
}


