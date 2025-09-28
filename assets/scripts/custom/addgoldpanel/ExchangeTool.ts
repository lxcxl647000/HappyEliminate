import { _decorator, Component, Label, Node, Sprite } from 'cc';
import CocosUtils from '../../utils/CocosUtils';
import { BundleConfigs } from '../../configs/BundleConfigs';
import PlayerMgr from '../../game/PlayerMgr';
import { qc } from '../../framework/qc';
import { Constants } from '../../game/Constants';
const { ccclass, property } = _decorator;

export interface ExchangeData {
    id: number;
    name: string;
    icon: string;
    exchange: number;
}

@ccclass('ExchangeTool')
export class ExchangeTool extends Component {
    @property(Label)
    gold: Label = null!
    @property(Sprite)
    icon: Sprite = null!

    private _data: ExchangeData = null!

    public init(data: ExchangeData) {
        this._data = data;
        this.gold.string = `${data.exchange}金币`;
        CocosUtils.loadTextureFromBundle(BundleConfigs.iconBundle, data.icon, this.icon);
    }

    onClickTool() {
        if (PlayerMgr.ins.player.gold < this._data.exchange) {
            return;
        }
        PlayerMgr.ins.addGold(-this._data.exchange);
        PlayerMgr.ins.addItem(this._data.id, 1);
        qc.storage.setObj(Constants.PLAYER_DATA_KEY, PlayerMgr.ins.player);
    }
}


