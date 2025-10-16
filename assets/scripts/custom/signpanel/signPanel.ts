import { _decorator, Color, instantiate, Label, Node, Sprite, UITransform } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import CustomSprite from '../componetUtils/CustomSprite';
import { PanelConfigs } from '../../configs/PanelConfigs';
import SignApi from '../../api/sign';
import CocosUtils from '../../utils/CocosUtils';
import { BundleConfigs } from '../../configs/BundleConfigs';
import ConfigMgr from '../../manager/ConfigMgr';
import { configConfigs } from '../../configs/configConfigs';
import { ItemConfig } from '../../configs/ItemConfig';

const { ccclass, property } = _decorator;

@ccclass('signPanel')
export class signPanel extends PanelComponent {
    @property(Label)
    @property(Label)
    dateLabel: Label = null;
    @property(Node)
    rewardNode: Node = null;
    @property(Node)
    rewardImg: Node = null;
    @property(Node)
    receiveNode: Node = null;
    @property(Label)
    receiveBtnLabel: Label = null;
    @property(Label)
    taskName: Label = null;

    init() {
        SignApi.ins.getGiftList((res) => {
            console.log('res:', res);
            this.dateLabel.string = res.date.replace(/(\d+)\.(\d+)-(\d+)\.(\d+)/, '$1月$2日-$3月$4日');
            let rewardData = res.result;
            for (let i = 0; i < rewardData.length; i++) {
                // 父节点
                let itemNode = instantiate(this.rewardNode);
                itemNode.active = true;
                this.rewardNode.parent.addChild(itemNode);

                itemNode.getComponentInChildren(Label).string = `第${rewardData[i].day_index}天`;
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
                        CocosUtils.loadTextureFromBundle(BundleConfigs.iconBundle, itemConfig.icon, rewardImg.getComponent(Sprite));
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
                    bgSprite.index = 1;
                    itemNode.getChildByName('expiredBg').getChildByName('redDot').active = true;
                } else {
                    bgSprite.index = 2;
                }
                if (newRewardData[i].label === '已领取') {
                    itemNode.getChildByName('expiredBg').getChildByName('claimIcon').active = true;
                }
            }
        });
        // let rewardData = [
        //     {
        //         day_index: 1,
        //         label: '已领取',
        //         status: 'disabled',
        //         reward: [
        //             {
        //                 type: 1,
        //                 reward: 10
        //             }
        //         ]
        //     },
        //     {
        //         day_index: 2,
        //         label: '已过期',
        //         status: 'disabled',
        //         reward: [
        //             {
        //                 type: 2,
        //                 reward: 20
        //             }
        //         ]
        //     },
        //     {
        //         day_index: 3,
        //         label: '今日领',
        //         status: 'enabled',
        //         reward: [
        //             {
        //                 type: 3,
        //                 reward: 2
        //             }
        //         ]
        //     },
        //     {
        //         day_index: 4,
        //         label: '明日领',
        //         status: 'disabled',
        //         reward: [
        //             {
        //                 type: 4,
        //                 reward: 3
        //             }
        //         ]
        //     },
        //     {
        //         day_index: 5,
        //         label: '',
        //         status: 'disabled',
        //         reward: [
        //             {
        //                 type: 3,
        //                 reward: 5
        //             }
        //         ]
        //     },
        //     {
        //         day_index: 6,
        //         label: '',
        //         status: 'disabled',
        //         reward: [
        //             {
        //                 type: 1,
        //                 reward: 20,
        //             },
        //             {
        //                 type: 2,
        //                 reward: 2,
        //             },
        //             {
        //                 type: 4,
        //                 reward: 4,
        //             }
        //         ]
        //     },
        //     {
        //         day_index: 7,
        //         label: '',
        //         status: 'disabled',
        //         reward: [
        //             {
        //                 type: 3,
        //                 reward: 4,
        //             }
        //         ]
        //     }
        // ];
        this.taskName.string = '今日任务：添加到桌面';
    }

    show(option: PanelShowOption): void {
        option.onShowed();
        this.init();
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    // 关闭弹框
    handleClosePop() {
        qc.panelRouter.hide({
            panel: PanelConfigs.signPanel
        })
    }

    // 领取奖励
    handleReceive() {
        this.receiveNode.getChildByName('playIcon').active = true;
        this.receiveBtnLabel.string = '再领一次';
        this.receiveBtnLabel.node.setPosition(22, 0, 0);
    }
}


