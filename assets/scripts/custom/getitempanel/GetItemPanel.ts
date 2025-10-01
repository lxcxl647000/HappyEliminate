import { _decorator, Component, Label, Node, Sprite } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import { ItemConfig, ItemType } from '../../configs/ItemConfig';
import CocosUtils from '../../utils/CocosUtils';
import { BundleConfigs } from '../../configs/BundleConfigs';
import { rewardedVideoAd } from '../../framework/lib/platform/platform_interface';
import { baseConfig } from '../../configs/baseConfig';
import PlayerMgr from '../../manager/PlayerMgr';
import CommonTipsMgr from '../../manager/CommonTipsMgr';
import ConfigMgr from '../../manager/ConfigMgr';
import { configConfigs } from '../../configs/configConfigs';
const { ccclass, property } = _decorator;

@ccclass('GetItemPanel')
export class GetItemPanel extends PanelComponent {
    @property(Node)
    adBtn: Node = null;
    @property(Node)
    goldBtn: Node = null;
    @property(Node)
    normalBtn: Node = null;
    @property(Label)
    numLabel: Label = null;
    @property(Label)
    desLabel: Label = null;
    @property(Sprite)
    icon: Sprite = null;

    private _itemType: ItemType = null;
    private _num: number = 0;
    private _isAdBtn: boolean = false;
    private _isNormal: boolean = false;
    private _costGold: number = 0;
    private _itemData: ItemConfig = null;

    show(option: PanelShowOption): void {
        option.onShowed();

        let { type, num, isAdBtn, costGold, isNormal } = option.data;
        this._itemType = type;
        this._num = num;
        this._isAdBtn = isAdBtn;
        this._isNormal = isNormal;
        this._costGold = costGold | 0;
        this._itemData = ConfigMgr.ins.getConfig<ItemConfig>(configConfigs.itemConfig, this._itemType);
        this._init();
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    private _init() {
        this.adBtn.active = this._isAdBtn;
        this.goldBtn.active = this._costGold > 0;
        if (this.goldBtn.active) {
            this.goldBtn.getComponentInChildren(Label).string = `${this._costGold}兑换`;
        }
        this.normalBtn.active = this._isNormal;
        this.numLabel.string = `${this._itemData.name}  *${this._num}`;
        this.desLabel.string = this._itemData.des;
        CocosUtils.loadTextureFromBundle(BundleConfigs.iconBundle, this._itemData.big_icon, this.icon);
    }

    private _hidePanel() {
        qc.panelRouter.hide({ panel: PanelConfigs.getItemPanel });
    }

    onClickClose() {
        if (this.adBtn.active || this.normalBtn.active) {
            PlayerMgr.ins.addItem(this._itemType, this._num, true);
        }
        this._hidePanel();
    }

    onAdBtn() {
        let ad: rewardedVideoAd = {
            adUnitId: baseConfig.adUnitIds[0],
            successCb: () => {
                PlayerMgr.ins.addItem(this._itemType, 2 * this._num, true);
                this._hidePanel();
            }
        };
        qc.platform.showRewardedAd(ad);
    }

    onGoldBtn() {
        if (PlayerMgr.ins.player.gold < this._costGold) {
            CommonTipsMgr.ins.showTips('金币不足');
            return;
        }
        PlayerMgr.ins.addGold(-this._costGold, false);
        PlayerMgr.ins.addItem(this._itemType, this._num, true);
        this._hidePanel();
    }

    onNormalBtn() {
        PlayerMgr.ins.addItem(this._itemType, this._num, true);
        this._hidePanel();
    }
}


