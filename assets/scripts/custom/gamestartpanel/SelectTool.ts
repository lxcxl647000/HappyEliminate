import { _decorator, Component, Label, Node } from 'cc';
import { qc } from '../../framework/qc';
import EventDef from '../../constants/EventDef';
import { ItemType } from '../../configs/ItemConfig';
import PlayerMgr from '../../manager/PlayerMgr';
import { LevelConfig } from '../../configs/LevelConfig';
const { ccclass, property } = _decorator;

@ccclass('SelectTool')
export class SelectTool extends Component {
    @property(Node)
    public selectNode: Node = null;
    @property(Label)
    public num: Label = null;

    private _itemNum: number = 0;
    private _itemType: ItemType = ItemType.Boom;

    public init(type: ItemType, num: number, level: LevelConfig) {
        this.selectNode.active = false;
        this._itemType = type;
        this._itemNum = num;
        this.num.string = 'x' + this._itemNum;

        // 新手引导第一关特殊处理 在新手引导时不能让玩家选择炸弹道具，引导会使用炸弹
        if (level.levelIndex === 1 && PlayerMgr.ins.userInfo.current_level.length === 0) {
            if (type === ItemType.Boom) {
                this.node.active = false;
            }
        }
        else {
            this.node.active = true;
        }
    }

    onClickItem() {
        if (this._itemNum < 1) {
            return;
        }
        this.selectNode.active = !this.selectNode.active;
        let num = 0;
        if (this.selectNode.active) {
            num = 1;
        }
        qc.eventManager.emit(EventDef.Select_Tool, this._itemType, num);
    }
}


