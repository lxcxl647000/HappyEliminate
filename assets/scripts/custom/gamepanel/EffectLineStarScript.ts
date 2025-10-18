import { _decorator, CCBoolean, Component, Node, tween, Vec3 } from 'cc';
import { Cell } from '../../game/Types';
const { ccclass, property } = _decorator;

/**
 * 从一个地方移动到另一个地方，
 * 过程中是粒子效果
 * 移动完成后自动移除
 */
@ccclass('EffectLineStarScript')
export class EffectLineStarScript extends Component {
    @property(CCBoolean)
    test: boolean = false;

    // 移动时长
    private duration: number = 0.5;
    private from: Vec3 = new Vec3(0);
    private to: Vec3 = new Vec3(0);

    start() {
        // if (this.test) {
        //     this.setPath(new Vec3(-320, 500, 0), new Vec3(0, 0));
        //     this.startMove();
        // }
    }

    update(deltaTime: number) {

    }

    setDuration(v: number) {
        this.duration = v;
    }

    setPath(from: Vec3, to: Vec3) {
        this.from = from;
        this.to = to;
    }

    startMove(cell: Cell, cb?: Function) {
        this.node.setPosition(this.from);
        tween(this.node)
            .to(this.duration, { position: this.to })
            .call(() => {
                this.node.removeFromParent();
                cb && cb(cell);
            })
            .start();
    }
}


