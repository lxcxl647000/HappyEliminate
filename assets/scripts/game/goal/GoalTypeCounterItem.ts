import { _decorator, Component, Label, Node, Prefab } from 'cc';
import { CellType } from '../Types';
import { CellScript } from '../../custom/gamepanel/CellScript';
const { ccclass, property } = _decorator;

@ccclass('GoalTypeCounterItem')
export class GoalTypeCounterItem extends Component {
    @property(Node)
    completeNode: Node;

    @property(Node)
    numNode: Node;

    @property(Node)
    cellNode: Node;

    start() {
        this.completeNode.active = false;
    }

    update(deltaTime: number) {

    }

    setNumber(num: number) {
        this.numNode.getComponent(Label).string = 'x' + JSON.stringify(num);
    }

    setComplete(flag: boolean) {
        this.completeNode.active = flag;
        // 如果完成了，则不显示数字
        this.numNode.active = !flag;
    }

    setType(cellType: CellType) {
        this.cellNode.getComponent(CellScript).setType(cellType);
        this.cellNode.setScale(.9, .9);
    }
}


