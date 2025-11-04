import { _decorator, Animation, Component, Label, Node } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import CocosUtils from '../../utils/CocosUtils';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import EventDef from '../../constants/EventDef';
import ItemMgr from '../../manager/ItemMgr';
import PlayerMgr from '../../manager/PlayerMgr';
import GetItemMgr from '../../manager/GetItemMgr';
import { ItemType } from '../../configs/ItemConfig';
const { ccclass, property } = _decorator;

@ccclass('SideRewardPanel')
export class SideRewardPanel extends PanelComponent {
    @property(Animation)
    guide: Animation = null!
    @property(Node)
    guide1PosNode: Node = null!
    @property(Node)
    guide2PosNode: Node = null!
    @property(Node)
    getRewardBtn: Node = null!
    @property(Node)
    toSidebarBtn: Node = null!

    private _isFromSide: boolean = false;

    protected onEnable(): void {
        qc.eventManager.on(EventDef.OnShow, this._onshow, this);
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.OnShow, this._onshow, this);
    }

    show(option: PanelShowOption): void {
        CocosUtils.openPopAnimation(this.node.getChildByName('SafeArea'), () => {
            option.onShowed();
            this._playGuide();
        });
        this._init();
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    private _init() {
        this._isFromSide = qc.platform.ttLaunch && (qc.platform.ttLaunch.scene === '021036' || qc.platform.ttLaunch.scene === '021012');
        this.getRewardBtn.active = this._isFromSide;
        this.toSidebarBtn.active = !this._isFromSide;
    }
    onBtnClick() {
        tt.navigateToScene({
            scene: 'sidebar',
            success: (res) => {
                console.log("navigate to scene success", res);
                // 跳转成功回调逻辑
            },
            fail: (res) => {
                console.log("navigate to scene fail: ", res);
                // 跳转失败回调逻辑
            },
        });
    }

    onBtnGetReward() {
        ItemMgr.ins.getCoinByTT((res: any) => {
            if (res.amount) {
                PlayerMgr.ins.userInfo.daily_coin_claimed = 1;
                PlayerMgr.ins.addGold(res.amount);
                GetItemMgr.ins.showGetItem(ItemType.Gold, res.amount);
                qc.eventManager.emit(EventDef.Hide_Side_Reward);
                this.onClose();
            }
        });
    }

    onClose() {
        this._stopGuide();
        qc.panelRouter.hide({ panel: PanelConfigs.sideRewardPanel });
    }

    private _onshow(res: any) {
        this._init();
    }

    private _playGuide() {
        let pos = CocosUtils.setNodeToTargetPos(this.guide.node, this.guide1PosNode);
        this.guide.node.setPosition(pos.x, pos.y, pos.z);
        this.guide.once(Animation.EventType.FINISHED, () => {
            let pos = CocosUtils.setNodeToTargetPos(this.guide.node, this.guide2PosNode);
            this.guide.node.setPosition(pos.x, pos.y, pos.z);
            this.guide.once(Animation.EventType.FINISHED, () => {
                this._playGuide();
            });
            this.guide.play('guide_click2');
        });
        this.guide.play('guide_click2');
    }

    private _stopGuide() {
        this.guide.stop();
    }
}
