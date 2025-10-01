import { _decorator, Component, Label, Node, UITransform } from 'cc';
import { ItemType } from '../../configs/ItemConfig';
import { ExchangeToolConfig } from '../../configs/ExchangeToolConfig';
import PlayerMgr from '../../manager/PlayerMgr';
import CocosUtils from '../../utils/CocosUtils';
import GetItemMgr from '../../manager/GetItemMgr';
import CommonTipsMgr from '../../manager/CommonTipsMgr';
import ConfigMgr from '../../manager/ConfigMgr';
import { configConfigs } from '../../configs/configConfigs';
const { ccclass, property } = _decorator;

@ccclass('GameExchangeTool')
export class GameExchangeTool extends Component {
    @property(Label)
    des: Label = null!
    @property(Node)
    bg: Node = null!

    private _itemType: ItemType = ItemType.Boom;
    private _data: ExchangeToolConfig = null;
    private _offsetX: number = 110;

    public show(toolBtn: Node, itemType: ItemType) {
        this._itemType = itemType;
        this._setPos(toolBtn);
        this.node.active = true;
        this._data = ConfigMgr.ins.getConfig<ExchangeToolConfig>(configConfigs.exchangeToolConfig, this._itemType, 'itemType');
        if (this._data) {
            this.des.string = `${this._data.exchange}金币兑换${this._data.name}`;
        }
    }

    public hide() {
        this.node.active = false;
    }

    private _setPos(target: Node) {
        let pos = CocosUtils.setNodeToTargetPos(this.node, target);
        let offsetY = target.getComponent(UITransform).height / 2 + 30;
        switch (this._itemType) {
            case ItemType.Hammer:
            case ItemType.Sort:
                this.bg.setScale(1, 1);
                pos.x += this._offsetX;
                break;
            case ItemType.Boom:
            case ItemType.Steps:
                this.bg.setScale(-1, 1);
                pos.x -= this._offsetX;
                break;
        }
        pos.y += offsetY;

        this.node.setPosition(pos);
    }

    onClickExchange() {
        if (this._data) {
            if (PlayerMgr.ins.player.gold < this._data.exchange) {
                this.node.active = false;
                CommonTipsMgr.ins.showTips('金币不足');
                return;
            }
            PlayerMgr.ins.addGold(-this._data.exchange, false);
            PlayerMgr.ins.addItem(this._itemType, 1, true);
            GetItemMgr.ins.showGetItem(this._itemType, 1);
        }
        this.node.active = false;
    }
}


