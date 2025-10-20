import { _decorator, Color, Component, Label, Node, Sprite } from 'cc';
import { ToolType } from '../../game/tools/ITool';
import { GamePanel } from './GamePanel';
import { qc } from '../../framework/qc';
import EventDef from '../../constants/EventDef';
import { ItemType } from '../../configs/ItemConfig';
import PlayerMgr from '../../manager/PlayerMgr';
import { GameExchangeTool } from './GameExchangeTool';
import CommonTipsMgr from '../../manager/CommonTipsMgr';
import ItemMgr, { IItem } from '../../manager/ItemMgr';
import { GuideType } from '../../manager/GuideMgr';
import { IdelState } from '../../game/gridstate/IdelState';
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
        this._leftUseNum = 1;
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
        // 如果不是idel不允许操作
        if (!(this._gamePanel.getLevelGridScript().getGridStateMachine().getCurrentState() instanceof IdelState)) {
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
        if (this._itemType === ItemType.Hammer) {
            qc.eventManager.emit(EventDef.HideGuide, GuideType.Force_Level_1_Select_Hammer);
        }
        else if (this._itemType === ItemType.Boom) {
            qc.eventManager.emit(EventDef.HideGuide, GuideType.Force_Level_1_Select_Boom);
        }
    }

    private _useToolSuccess(type: ToolType) {
        if (type !== this._toolType) {
            return;
        }
        this._leftUseNum--;
        let itemType = ItemType.Hammer;
        switch (type) {
            case ToolType.TYPE_HAMMER:
                itemType = ItemType.Hammer;
                break;
            case ToolType.TYPE_BOOM:
                itemType = ItemType.Boom;
                break;
            case ToolType.TYPE_STEPS:
                itemType = ItemType.Steps;
                break;
            case ToolType.RANDOM_GRID:
                itemType = ItemType.Sort;
                break;
            default:
                break;
        }

        // 新手引导第一关特殊处理 在结算时才发送使用道具给服务器，避免玩家在游戏中就把道具使用了，但未完成引导，再次触发引导时没有道具可用,这里只做客户端数据的刷新
        if (this._gamePanel.levelData.levelIndex === 1 && PlayerMgr.ins.userInfo.current_level.length === 0) {
            if (itemType === ItemType.Hammer || itemType === ItemType.Boom) {
                PlayerMgr.ins.addItem(itemType, -1);
            }
        }
        else {
            let item: IItem = ItemMgr.ins.getItem(itemType);
            if (item) {
                ItemMgr.ins.useItem(item.type, this._gamePanel.levelData.levelIndex, () => {
                    PlayerMgr.ins.addItem(this._itemType, -1);
                    this._updateBtnStuts(this._itemType);
                });
            }
        }
    }
}