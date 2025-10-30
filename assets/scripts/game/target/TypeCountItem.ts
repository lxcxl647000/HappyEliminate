import { _decorator, Animation, Component, Label, Node } from 'cc';
import { BlockType } from '../GameConstant';
import { BlockComponent } from '../../custom/gamepanel/BlockComponent';
const { ccclass, property } = _decorator;

@ccclass('TypeCountItem')
export class TypeCountItem extends Component {
    @property(Node)
    completeNode: Node;
    @property(Label)
    numLabel: Label;
    @property(BlockComponent)
    block: BlockComponent;

    start() {
        this.completeNode.active = false;
    }

    setNumber(num: number, playAni: boolean = false) {
        if (playAni) {
            let oldNum = +this.numLabel.string.slice(1);
            if (oldNum !== num) {
                this.playTargetAni();
            }
        }
        this.numLabel.string = 'x' + JSON.stringify(num);
    }

    setComplete(flag: boolean) {
        this.completeNode.active = flag;
        this.numLabel.node.active = !flag;
    }

    setType(blockType: BlockType) {
        this.block.setType(blockType);
        this.block.node.setScale(.9, .9);
    }

    public playTargetAni() {
        let ani = this.getComponent(Animation);
        if (ani) {
            ani.play();
        }
    }
}


