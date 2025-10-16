import { _decorator, Component, Label, Node, Sprite } from 'cc';
import CocosUtils from '../../utils/CocosUtils';
import { BundleConfigs } from '../../configs/BundleConfigs';
import PlayerMgr from '../../manager/PlayerMgr';
import GetItemMgr from '../../manager/GetItemMgr';
import CommonTipsMgr from '../../manager/CommonTipsMgr';
import ConfigMgr from '../../manager/ConfigMgr';
import { ItemConfig } from '../../configs/ItemConfig';
import { configConfigs } from '../../configs/configConfigs';
import { IItem } from '../../manager/ItemMgr';
const { ccclass, property } = _decorator;

@ccclass('ExchangeTool')
export class ExchangeTool extends Component {
    @property(Label)
    gold: Label = null!
    @property(Sprite)
    icon: Sprite = null!

    private _data: IItem = null!

    public init(data: IItem) {
        this._data = data;
        this.gold.string = `${data.price}金币`;
        let item = ConfigMgr.ins.getConfig<ItemConfig>(configConfigs.itemConfig, data.id);
        if (item) {
            CocosUtils.loadTextureFromBundle(BundleConfigs.iconBundle, item.icon, this.icon);
        }
    }

    onClickTool() {
        if (PlayerMgr.ins.userInfo.props.integral < this._data.price) {
            CommonTipsMgr.ins.showTips('金币不足');
            return;
        }
        GetItemMgr.ins.showGetItem(this._data.id, 1, false, this._data.price);
    }
}


