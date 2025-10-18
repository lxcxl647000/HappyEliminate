import { _decorator, Animation, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Head')
export class Head extends Component {
    @property(Animation)
    star2Animation: Animation = null;
    @property(Animation)
    star1Animation: Animation = null;
    @property(Animation)
    ligthAnimation: Animation = null;
    @property(Animation)
    headAnimation: Animation = null;

    public playAni() {
        this.star1Animation.play();
        this.star2Animation.play();
        this.ligthAnimation.play();
        this.headAnimation.play();
    }
}


