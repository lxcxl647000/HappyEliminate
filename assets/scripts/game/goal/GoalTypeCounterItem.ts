import { _decorator, Animation, Component, Label, Node, Prefab } from 'cc';
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

    setNumber(num: number, playAni: boolean = false) {
        let numLabel = this.numNode.getComponent(Label);
        if (playAni) {
            let oldNum = +numLabel.string.slice(1);
            if (oldNum !== num) {
                this.playGoalAni();
            }
        }
        numLabel.string = 'x' + JSON.stringify(num);
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

    public playGoalAni() {
        let ani = this.getComponent(Animation);
        if (ani) {
            ani.play();
        }
    }
}


