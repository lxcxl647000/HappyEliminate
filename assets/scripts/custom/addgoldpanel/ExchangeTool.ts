import { _decorator, Component, Label, Node, Sprite } from 'cc';
import CocosUtils from '../../utils/CocosUtils';
import { BundleConfigs } from '../../configs/BundleConfigs';
import PlayerMgr from '../../manager/PlayerMgr';
import GetItemMgr from '../../manager/GetItemMgr';
import CommonTipsMgr from '../../manager/CommonTipsMgr';
import { ExchangeToolConfig } from '../../configs/ExchangeToolConfig';
import ConfigMgr from '../../manager/ConfigMgr';
import { ItemConfig } from '../../configs/ItemConfig';
import { configConfigs } from '../../configs/configConfigs';
const { ccclass, property } = _decorator;

@ccclass('ExchangeTool')
export class ExchangeTool extends Component {
    @property(Label)
    gold: Label = null!
    @property(Sprite)
    icon: Sprite = null!

    private _data: ExchangeToolConfig = null!

    public init(data: ExchangeToolConfig) {
        this._data = data;
        this.gold.string = `${data.exchange}金币`;
        let item = ConfigMgr.ins.getConfig<ItemConfig>(configConfigs.itemConfig, data.itemType);
        if (item) {
            CocosUtils.loadTextureFromBundle(BundleConfigs.iconBundle, item.icon, this.icon);
        }
    }

    onClickTool() {
        if (PlayerMgr.ins.player.gold < this._data.exchange) {
            CommonTipsMgr.ins.showTips('金币不足');
            return;
        }
        GetItemMgr.ins.showGetItem(this._data.itemType, 1, false, this._data.exchange);
    }
}


