import { _decorator, Component, Label, Node } from 'cc';
import { qc } from '../../framework/qc';
import EventDef from '../../constants/EventDef';
import { ItemType } from '../../configs/ItemConfig';
const { ccclass, property } = _decorator;

@ccclass('SelectTool')
export class SelectTool extends Component {
    @property(Node)
    public selectNode: Node = null;
    @property(Label)
    public num: Label = null;

    private _itemNum: number = 0;
    private _itemType: ItemType = ItemType.Boom;

    public init(type: ItemType, num: number) {
        this.selectNode.active = false;
        this._itemType = type;
        this._itemNum = num;
        this.num.string = 'x' + this._itemNum;
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


