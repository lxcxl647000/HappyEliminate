import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { Block } from '../../game/Block';
const { ccclass, property } = _decorator;

@ccclass('LineEffect')
export class LineEffect extends Component {
    // 移动时长
    private duration: number = 0.5;
    private from: Vec3 = new Vec3(0);
    private to: Vec3 = new Vec3(0);

    update(deltaTime: number) {

    }

    setDuration(v: number) {
        this.duration = v;
    }

    setLinePath(from: Vec3, to: Vec3) {
        this.from = from;
        this.to = to;
    }

    startToMove(block: Block, cb?: Function) {
        this.node.setPosition(this.from);
        tween(this.node)
            .to(this.duration, { position: this.to })
            .call(() => {
                cb && cb(block);
                this.node.removeFromParent();
            })
            .start();
    }
}


