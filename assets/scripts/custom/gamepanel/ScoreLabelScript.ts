import { _decorator, Color, Component, Label, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 展示得分，往上漂，然后消失
 */
@ccclass('ScoreLabelScript')
export class ScoreLabelScript extends Component {
    duration: number = 1;
    start() {
        let pos = this.node.getPosition();
        let newPos = new Vec3(pos.x, pos.y + 20, pos.z);
        let newScale = new Vec3(2, 2, 1);
        tween(this.node)
        .call(() => {
        })
        .to(this.duration, { 
            position: newPos,
            scale: newScale ,
        })
        .call(() => {
            this.node.removeFromParent()
        })
        .start()
        .removeSelf();
    }

    update(deltaTime: number) {
        
    }

    setValue(v: number) {
        this.getComponent(Label).string = JSON.stringify(v);
    }

    setColor(color: Color) {
        this.getComponent(Label).color = color;
    }
}


