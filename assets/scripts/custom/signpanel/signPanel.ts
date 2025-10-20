import { _decorator, Color, instantiate, Label, Node, Sprite, UITransform } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import CustomSprite from '../componetUtils/CustomSprite';
import { PanelConfigs } from '../../configs/PanelConfigs';
import SignApi from '../../api/sign';
import { renwuMgr } from '../../manager/TaskMgr';
import CocosUtils from '../../utils/CocosUtils';
import { BundleConfigs } from '../../configs/BundleConfigs';
import ConfigMgr from '../../manager/ConfigMgr';
import { configConfigs } from '../../configs/configConfigs';
import {ItemConfig, ItemType} from '../../configs/ItemConfig';
import CommonTipsMgr from "../../manager/CommonTipsMgr";
import PlayerMgr from "../../manager/PlayerMgr";
import { rewardedVideoAd } from "../../framework/lib/platform/platform_interface";
import { baseConfig } from "../../configs/baseConfig";
import EventDef from "db://assets/scripts/constants/EventDef";
import GetItemMgr from "db://assets/scripts/manager/GetItemMgr";

const { ccclass, property } = _decorator;

@ccclass('signPanel')
export class signPanel extends PanelComponent {
    @property(Label)
    @property(Label)
    dateLabel: Label = null;
    @property(Node)
    rewardNode: Node = null;
    @property(Node)
    rewardParentNode: Node = null;
    @property(Node)
    rewardImg: Node = null;
    @property(Node)
    receiveNode: Node = null;
    @property(Label)
    receiveBtnLabel: Label = null;
    @property(Label)
    taskName: Label = null;
    @property(Sprite)
    taskImg: Sprite = null;
    @property(Sprite)
    taskIcon: Sprite = null;
    @property(Label)
    rewardCount: Label = null;
    @property(Label)
    taskBtnLabel: Label = null;
    
    private gift_id = '';
    private hasClaimedToday = '';
    private taskData = null;

    private getBtnStatus(type) {
        if (type === 1) { // 未领取
            this.receiveNode.getChildByName('playIcon').active = false;
            this.receiveBtnLabel.string = '立即收下';
            this.receiveBtnLabel.node.setPosition(0, 6, 0);
        } else if (type === 2) { // 再领一次
            this.receiveNode.getChildByName('playIcon').active = true;
            this.receiveBtnLabel.string = '再领一次';
            this.receiveBtnLabel.node.setPosition(22, 6, 0);
        } else { // 已领取
            this.receiveNode.getChildByName('playIcon').active = false;
            this.receiveBtnLabel.string = '已领取';
            this.receiveBtnLabel.node.setPosition(0, 6, 0);
        }
    }
    init() {
        this.rewardParentNode.destroyAllChildren();
        SignApi.ins.getGiftList((res) => {
            this.dateLabel.string = res.date.replace(/(\d+)\.(\d+)-(\d+)\.(\d+)/, '$1月$2日-$3月$4日');

            let rewardData = res.result;
            // 优先检查是否有未领取的奖励
            let hasEnabledReward = false;

            for (let i = 0; i < rewardData.length; i++) {
                // 父节点
                let itemNode = instantiate(this.rewardNode);
                itemNode.active = true;
                this.rewardParentNode.addChild(itemNode);
                itemNode.getComponentInChildren(Label).string = `第${rewardData[i].day_index}天`;
                if (res.currentDay === Number(rewardData[i].day_index)) {
                    this.gift_id = rewardData[i].reward.gift_id;
                }

                const newRewardData = rewardData.map(item => {
                    const reward = item.reward;
                    const rewardTypes = reward.reward_type.split(',').map(type => parseInt(type));

                    const rewardList = rewardTypes.map(type => {
                        return {
                            type: type,
                            rewardCount: type === 1 ? parseInt(reward.gold_num) : parseInt(reward.prop_num)
                        }
                    });

                    return {
                        ...item,
                        rewardList: rewardList
                    }
                });

                const rewardArr = newRewardData[i].rewardList;
                // 奖励类型 type 1: 金币，2: 锤子，3: 体力，4: 炸弹， 5：主题碎片，6：步数，7：打乱棋盘
                for (let k = 0; k < rewardArr.length; k++) {
                    const rewardType = rewardArr[k].type;
                    let rewardImgItem = itemNode.getChildByName('expiredBg').getChildByName('rewardItemNode');
                    let rewardImg = instantiate(this.rewardImg);
                    rewardImg.active = true;
                    rewardImgItem.addChild(rewardImg);
                    let itemConfig = ConfigMgr.ins.getConfig<ItemConfig>(configConfigs.itemConfig, rewardType);
                    if (itemConfig) {
                        CocosUtils.loadTextureFromBundle(BundleConfigs.iconBundle, itemConfig.icon, rewardImg.getComponentInChildren(Sprite));
                        if (rewardType === 1) {
                            rewardImg.getComponentInChildren(Label).string = `${String(rewardArr[k].rewardCount)}${itemConfig.name}`;
                        } else if (rewardType === 5) {
                            rewardImg.getComponentInChildren(Label).string = `碎片×${String(rewardArr[k].rewardCount)}`;
                        } else if (rewardType === 7) {
                            rewardImg.getComponentInChildren(Label).string = `打乱×${String(rewardArr[k].rewardCount)}`;
                        } else {
                            rewardImg.getComponentInChildren(Label).string = `${itemConfig.name}×${String(rewardArr[k].rewardCount)}`;
                        }
                    }

                    itemNode.getChildByName('expiredBg').getChildByName('rewardItemNode').addChild(rewardImg)
                    if (newRewardData[i].label === '已过期' || newRewardData[i].label === '已领取') {
                        rewardImg.getComponent(Sprite).color = new Color(255, 255, 255, 100);
                    }
                }
                if (rewardArr.length > 1) {
                    itemNode.getChildByName('expiredBg').getComponent(UITransform).width = 284;
                    itemNode.getChildByName('expiredBg').parent.getComponent(UITransform).width = 284;
                }


                if (newRewardData[i].label === '明日领') {
                    itemNode.getComponentInChildren(Label).string = newRewardData[i].label;
                }

                let bgSprite = itemNode.getChildByName('expiredBg').getComponent(CustomSprite);
                if (newRewardData[i].label === '已过期') {
                    bgSprite.index = 0;
                    itemNode.getChildByName('expiredBg').getChildByName('timeoutIcon').active = true;
                } else if (newRewardData[i].label === '今日领') {
                    this.receiveBtnLabel.string = '立即收下';
                    bgSprite.index = 1;
                    itemNode.getChildByName('expiredBg').getChildByName('redDot').active = true;
                } else {
                    bgSprite.index = 2;
                }
                if (newRewardData[i].label === '已领取') {
                    itemNode.getChildByName('expiredBg').getChildByName('claimIcon').active = true;
                }
            }

            for (let i = 0; i < rewardData.length; i++) {
                if (rewardData[i].status === 'enabled') { // 未领取
                    hasEnabledReward = true;
                    this.getBtnStatus(1);
                    this.hasClaimedToday = '1';
                    return;
                }
            }

            // 如果没有未领取的奖励，则根据 again 状态判断
            if (!hasEnabledReward) {
                if (res.again == 0) { // 再领一次
                    this.getBtnStatus(2);
                    this.hasClaimedToday = '2';
                } else if (res.again == 1) { // 已领取
                    this.getBtnStatus(3);
                    this.hasClaimedToday = '3';
                }
            }
        });
    }

    // 领取奖励
    private getReward(type, count1, count2) {
        this.init();
        CommonTipsMgr.ins.showTips('领取成功');
        const reward_type = type.split(',');
        if (reward_type.indexOf('1') !== -1) { // 金币
            PlayerMgr.ins.addGold(Number(count1));
        } else if (reward_type.indexOf('3') !== -1) { // 体力
            PlayerMgr.ins.addEnergy(Number(count2));
        }
    }

    // 领取签到
    async handleReceive() {
        if (this.hasClaimedToday === '1') { // 未领取
            await SignApi.ins.receiveGift({
                gift_id: this.gift_id
            }, (res) => {
                this.getReward(res.rewards.reward_type, res.rewards.gold_num, res.rewards.prop_num);
            });
            await PlayerMgr.ins.getHomeData();
        } else if (this.hasClaimedToday === '2') { //再领一次
            let ad: rewardedVideoAd = {
                adUnitId: baseConfig.adUnitIds[0],
                successCb: (res) => {
                },
                failCb: async (res) => {
                    if (res.isCompleted) {
                        await SignApi.ins.receiveAgain({
                            gift_id: this.gift_id
                        }, (res) => {
                            this.getReward(res.rewards.reward_type, res.rewards.gold_num, res.rewards.prop_num);
                        });
                        await PlayerMgr.ins.getHomeData();
                    } else {
                        CommonTipsMgr.ins.showTips('未完成广告浏览');
                    }
                },
            }
            qc.platform.showRewardedAd(ad);
        }
    }

    // 加载远程图片
    setRemoteImage(url: string, nodeSprite: Sprite) {
        CocosUtils.loadRemoteTexture(url, nodeSprite);
    }

    // 获取任务
    private getTask() {
        SignApi.ins.getTaskList((res) => {
            if (res.tag.sign) {
                this.taskData = res.task.filter(item => item.id === res.tag.sign[0])[0];
                this.taskName.string = `今日任务：${this.taskData.title}`;
                this.setRemoteImage(this.taskData.image, this.taskImg);
                if (this.taskData.reward_type == '1') {
                    this.taskIcon.getComponent(CustomSprite).index = 1;
                } else {
                    this.taskIcon.getComponent(CustomSprite).index = 0;
                }
                this.rewardCount.string = this.taskData.reward_type == '1' ? `+${this.taskData.money}元` : `+${this.taskData.integral}金币`;
                this.taskBtnLabel.string = this.taskData.isComplete ? '已完成' : this.taskData.button_text;
            }
        });
    }

    handleCompleteTask() {
        if (this.taskData.isCompleteTask) {
            return;
        }
        renwuMgr.ins.clickTask(+this.taskData.id, () => {
            renwuMgr.ins.recordTime = new Date();
            renwuMgr.ins.jumpTask = this.taskData;
            let task_type = +this.taskData.task_type;
            switch (task_type) {
                case 8:// 跳转
                    location.href = this.taskData.jump_pages;
                    break;
                case 12:// 激励广告
                    let ad: rewardedVideoAd = {
                        adUnitId: this.taskData.ad_id,
                        successCb: (e) => {
                        },
                        failCb: (e) => {
                            if (!e.isCompleted) {
                                CommonTipsMgr.ins.showTips('浏览未完成');
                            } else {
                                this.completeTask();
                            }
                        },
                    }
                    qc.platform.showRewardedAd(ad);
                    break;
                default:
                    break;
            }

        });
    }
    // 完成任务
    private completeTask() {
        renwuMgr.ins.completeTask(renwuMgr.ins.jumpTask, (res) => {
            renwuMgr.ins.jumpTask = null;
            if (res.task === 2) {
                this.getTask();
                if (res.award_type === '1') {
                    PlayerMgr.ins.addCash(+res.award);
                    GetItemMgr.ins.showGetItem(ItemType.RedPack, +res.award);
                } else {
                    PlayerMgr.ins.addGold(+res.award);
                    GetItemMgr.ins.showGetItem(ItemType.Gold, +res.award);
                }
            } else if (res.task === 3) {
                CommonTipsMgr.ins.showTips('当前任务已完成,无法重复完成');
            }
        });
    }

    _onshow(res) {
        if (renwuMgr.ins.jumpTask) {
            // @ts-ignore
            let readTimeBool = (new Date() - renwuMgr.ins.recordTime) / 1000 < renwuMgr.ins.jumpTask.browse_time;
            if(this.taskData.task_type !== '12') {
                if (readTimeBool) {
                    CommonTipsMgr.ins.showTips(`访问${renwuMgr.ins.jumpTask.browse_time}秒以上,才能领取奖励哦`);
                    renwuMgr.ins.recordTime = null;
                } else {
                    this.completeTask();
                }
            }
        }
    }

    show(option: PanelShowOption): void {
        option.onShowed();
        this.init();
        this.getTask();
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    protected onEnable(): void {
        qc.eventManager.on(EventDef.OnShow, this._onshow, this);
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.OnShow, this._onshow, this);
    }

    // 关闭弹框
    handleClosePop() {
        qc.panelRouter.hide({
            panel: PanelConfigs.signPanel
        })
    }
}


