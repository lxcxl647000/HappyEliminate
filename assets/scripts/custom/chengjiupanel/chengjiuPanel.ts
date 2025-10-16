import { _decorator, assetManager, AssetManager, ImageAsset, SpriteFrame, Component, instantiate, Label, log, Mask, Node, Sprite, Texture2D } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import { contentItem } from './contentItem';
import ListCom from '../../framework/lib/components/scrollviewplus/ListCom';
import AchievementApi from '../../api/Achievement';
import CommonTipsMgr from '../../manager/CommonTipsMgr';
import LevelMgr from '../../manager/LevelMgr';
import PlayerMgr from '../../manager/PlayerMgr';
const { ccclass, property } = _decorator;
@ccclass('chengjiuPanel')
export class chengjiuPanel extends PanelComponent {
    // 任务节点
    @property(Node)
    taskNode: Node = null;
    // 装任务的容器
    @property(Node)
    taskListNode: Node = null;

    @property(ListCom)
    list: ListCom = null;

    taskList: any[] = []

    show(option: PanelShowOption): void {
        // console.log(this.tmp);
        log('------------------');
        option.onShowed();
        this.init();
    }
    // 每次打开都会触发
    protected onEnable(): void {
        // console.log(this.tmp, 111111111);
    }



    hide(option: PanelHideOption): void {
        option.onHided();
    }
    // 只会触发一次
    start() {

    }
    update(deltaTime: number) {

    }
    closeModel() {
        this.list.numItems = 0;
        qc.panelRouter.hide({
            panel: PanelConfigs.chengjiuPanel,
            onHided: () => {
                console.log('close test panel-----------');

            }
        });
    }
    async init() {
        let data = await AchievementApi.ins.getAchievementList();

        this.taskList = data.data
        console.log('成就列表数据', this.taskList);

        this.list.numItems = this.taskList.length;



    }

    onRenderRenwuItem(item: Node, index: number) {
        item.active = true;
        let chengjiu = item.getComponent(contentItem);
        if (chengjiu) {
            chengjiu.setData(this.taskList[index]);
        }
    }
    submitBtn(e: any) {
        console.log(e.currentTarget);

        if (e.currentTarget['data'] == 1) {
            AchievementApi.ins.claimAchievement({ achievementId: e.currentTarget['achievementId'] }).then((res) => {
                console.log(res);
                CommonTipsMgr.ins.showTips('领取成功');
                PlayerMgr.ins.getHomeData()
                // PlayerMgr.ins.addGold()
                // PlayerMgr.ins.addItem()
                this.init()
            })
        } else if (e.currentTarget['data'] == 2) {
            CommonTipsMgr.ins.showTips('已领取');
            console.log('已领取');

        }
        else {
            this.closeModel()
            let level = PlayerMgr.ins.userInfo.summary.latest_passed_level + 1;
            let mapid = PlayerMgr.ins.userInfo.summary.map_on;
            LevelMgr.ins.goToLevel(mapid, level, null)
            // CommonTipsMgr.ins.showTips('去完成任务');
            console.log('完成任务')
        }
    }
}


