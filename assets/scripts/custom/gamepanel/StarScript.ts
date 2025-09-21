import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StarScript')
export class StarScript extends Component {

    @property(SpriteFrame)
    starFill : SpriteFrame;

    @property(SpriteFrame)
    starEmpty : SpriteFrame;

    start() {

    }

    update(deltaTime: number) {
        
    }

    setFillOrEmpty(flag: boolean) {
        if (flag) {
            this.getComponent(Sprite).spriteFrame = this.starFill;
        } else {
            this.getComponent(Sprite).spriteFrame = this.starEmpty;
        }
    }
}


