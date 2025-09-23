import { _decorator, Color, instantiate, Label, Node, Sprite, UITransform } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import CustomSprite from '../componetUtils/CustomSprite';
import { PanelConfigs } from '../../configs/PanelConfigs';
const { ccclass, property } = _decorator;
@ccclass('signPanel')
export class signPanel extends PanelComponent {
    @property(Label)
    startTime: Label = null;
    @property(Label)
    endTime: Label = null;
    @property(Node)
    rewardNode: Node = null;
    @property(Node)
    rewardItem: Node = null;
    @property(Node)
    receiveNode: Node = null;
    @property(Label)
    receiveBtnLabel: Label = null;
    @property(Label)
    taskName: Label = null;

    init() {
        let rewardData = [
            {
                day_index: 1,
                label: '已领取',
                status: 'disabled',
                // type: 1,
                // reward: 10
                rewardList: [
                    {
                        type: 1,
                        reward: 10
                    }
                ]
            },
            {
                day_index: 2,
                label: '已过期',
                status: 'disabled',
                rewardList: [
                    {
                        type: 2,
                        reward: 20
                    }
                ]
            },
            {
                day_index: 3,
                label: '今日领',
                status: 'enabled',
                rewardList: [
                    {
                        type: 3,
                        reward: 2
                    }
                ]
            },
            {
                day_index: 4,
                label: '明日领',
                status: 'disabled',
                rewardList: [
                    {
                        type: 4,
                        reward: 3
                    }
                ]
            },
            {
                day_index: 5,
                label: '',
                status: 'disabled',
                rewardList: [
                    {
                        type: 3,
                        reward: 5
                    }
                ]
            },
            {
                day_index: 6,
                label: '',
                status: 'disabled',
                rewardList: [
                    {
                        type: 1,
                        reward: 20,
                    },
                    {
                        type: 2,
                        reward: 2,
                    },
                    {
                        type: 4,
                        reward: 4,
                    }
                ]
            },
            {
                day_index: 7,
                label: '',
                status: 'disabled',
                rewardList: [
                    {
                        type: 3,
                        reward: 4,
                    }
                ]
            }
        ];

        for (let i = 0; i < rewardData.length; i++) {
            // 父节点
            let itemNode = instantiate(this.rewardNode);
            itemNode.active = true;
            this.rewardNode.parent.addChild(itemNode);

            itemNode.getComponentInChildren(Label).string = `第${rewardData[i].day_index}天`;

            // 奖励类型 type 1: 爱心，2: 金币，3: 锤子，4: 炸弹
            for (let k = 0; k < rewardData[i].rewardList.length; k++) {
                let rewardItem = instantiate(this.rewardItem);

                switch (rewardData[i].rewardList[k].type) {
                    case 1:
                        rewardItem.getComponent(CustomSprite).index = 0;
                        rewardItem.getComponentInChildren(Label).string = `${String(rewardData[i].rewardList[k].reward)}体力`;
                        break;
                    case 2:
                        rewardItem.getComponent(CustomSprite).index = 1;
                        rewardItem.getComponentInChildren(Label).string = `${String(rewardData[i].rewardList[k].reward)}金币`;
                        break;
                    case 3:
                        rewardItem.getComponent(CustomSprite).index = 2;
                        rewardItem.getComponentInChildren(Label).string = `锤子×${String(rewardData[i].rewardList[k].reward)}`;
                        break;
                    case 4:
                        rewardItem.getComponent(CustomSprite).index = 3;
                        rewardItem.getComponentInChildren(Label).string = `炸弹×${String(rewardData[i].rewardList[k].reward)}`;
                        break;
                }
                rewardItem.active = true;
                itemNode.getChildByName('expiredBg').getChildByName('rewardItemNode').addChild(rewardItem)
                if (rewardData[i].label === '已过期' || rewardData[i].label === '已领取') {
                    rewardItem.getComponent(Sprite).color = new Color(255, 255, 255, 100);
                }
            }


            if (rewardData[i].label === '明日领') {
                itemNode.getComponentInChildren(Label).string = rewardData[i].label;
            }

            let bgSprite = itemNode.getChildByName('expiredBg').getComponent(CustomSprite);
            if (rewardData[i].label === '已过期') {
                bgSprite.index = 0;
                itemNode.getChildByName('expiredBg').getChildByName('timeoutIcon').active = true;
            } else if (rewardData[i].label === '今日领') {
                bgSprite.index = 1;
                itemNode.getChildByName('expiredBg').getChildByName('redDot').active = true;
            } else {
                bgSprite.index = 2;
            }
            if (rewardData[i].label === '已领取') {
                itemNode.getChildByName('expiredBg').getChildByName('claimIcon').active = true;
            }

            if (rewardData[i].rewardList.length > 1) {
                itemNode.getChildByName('expiredBg').getComponent(UITransform).width = 284;
                itemNode.getChildByName('expiredBg').parent.getComponent(UITransform).width = 284;
            }
        }
        this.startTime.string = '9月10日';
        this.endTime.string = '9月17日';
        this.taskName.string = '今日任务：添加到桌面';
    }
    start() {
    }

    update(deltaTime: number) {

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


