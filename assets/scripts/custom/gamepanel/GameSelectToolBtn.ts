import { _decorator, Color, Component, Label, Node, Sprite } from 'cc';
import { ToolType } from '../../game/tools/ITool';
import { GamePanel } from './GamePanel';
import { qc } from '../../framework/qc';
import EventDef from '../../constants/EventDef';
import { ItemType } from '../../configs/ItemConfig';
import PlayerMgr from '../../manager/PlayerMgr';
import { GameExchangeTool } from './GameExchangeTool';
import CommonTipsMgr from '../../manager/CommonTipsMgr';
const { ccclass, property } = _decorator;

@ccclass('GameSelectToolBtn')
export class GameSelectToolBtn extends Component {
    @property(Node)
    numNode: Node = null!
    @property(Label)
    numLabel: Label = null!

    private _exchange: GameExchangeTool = null;
    private _gamePanel: GamePanel = null;
    private _toolType: ToolType = ToolType.INVALID;
    private _itemType: ItemType = ItemType.Boom;
    private _num: number = 0;
    // 剩余使用次数，一句只能使用一次//
    private _leftUseNum = 1;

    private _usedColor = new Color(167, 167, 167);

    protected start(): void {
        qc.eventManager.on(EventDef.Game_Select_Tool_Success, this._useToolSuccess, this);
        qc.eventManager.on(EventDef.Update_Item, this._updateBtnStuts, this);
    }

    protected onDestroy(): void {
        qc.eventManager.off(EventDef.Game_Select_Tool_Success, this._useToolSuccess, this);
        qc.eventManager.off(EventDef.Update_Item, this._updateBtnStuts, this);
    }

    public init(type: ToolType, gamePanel: GamePanel, exchange: GameExchangeTool) {
        this._exchange = exchange;
        this._gamePanel = gamePanel;
        this._toolType = type;
        switch (this._toolType) {
            case ToolType.TYPE_BOOM:
                this._itemType = ItemType.Boom;
                break;
            case ToolType.TYPE_HAMMER:
                this._itemType = ItemType.Hammer;
                break;
            case ToolType.TYPE_STEPS:
                this._itemType = ItemType.Steps;
                break;
            case ToolType.RANDOM_GRID:
                this._itemType = ItemType.Sort;
                break;
        }
        this._updateBtnStuts(this._itemType);
    }

    private _updateBtnStuts(itemType: ItemType) {
        if (itemType !== this._itemType) {
            return;
        }
        this._num = PlayerMgr.ins.getItemNum(this._itemType);
        this.getComponent(Sprite).color = this._leftUseNum > 0 ? Color.WHITE : this._usedColor;
        this.numNode.active = this._leftUseNum > 0 && this._num > 0;
        this.numLabel.string = this._num.toString();
    }

    onClickTool() {
        if (!this._gamePanel.getIsFirstStableHappened()) {
            return;
        }
        if (this._exchange.node.active) {
            this._exchange.hide();
        }
        if (this._leftUseNum <= 0) {
            CommonTipsMgr.ins.showTips('本局使用次数已用完');
            return;
        }
        if (this._gamePanel.isFinish) {
            return;
        }
        if (this._num <= 0) {
            // 弹出兑换框//
            this._exchange.show(this.node, this._itemType);
            return;
        }
        qc.eventManager.emit(EventDef.Game_Select_Tool, this._toolType);
    }

    private _useToolSuccess(type: ToolType) {
        if (type !== this._toolType) {
            return;
        }
        this._leftUseNum--;
        PlayerMgr.ins.addItem(this._itemType, -1, true);
        this._updateBtnStuts(this._itemType);
    }
}


