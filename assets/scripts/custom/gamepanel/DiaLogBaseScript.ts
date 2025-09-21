import { _decorator, Component, tween, Vec3 } from 'cc';
import { Constants } from '../../game/Constants';
const { ccclass, property } = _decorator;

export interface IDialogOption {
    onConform?: () => void;
    onCancel?: () => void;
}

@ccclass('DiaLogBaseScript')
export class DiaLogBaseScript extends Component {

    protected dialogOpt: IDialogOption;
    start() {
        // 默认设置到很小
        this.node.setScale(new Vec3(0.1, 0.1, 1));
    }

    update(deltaTime: number) {

    }
    show(opt?: IDialogOption) {
        this.dialogOpt = opt;
        // 默认设置到很小
        this.node.setScale(new Vec3(0.1, 0.1, 1));
        // 展示的时候动画弹出
        tween(this.node)
            .to(Constants.DIALOG_SHOW_OR_HIDE_DURATION, { scale: new Vec3(1, 1, 1) })
            .call(() => {
            })
            .start();
    }

    remove() {
        tween(this.node)
            .to(Constants.DIALOG_SHOW_OR_HIDE_DURATION, { scale: new Vec3(0.1, 0.1, 0) })
            .call(() => {
                this.node.removeFromParent();
            })
            .start();
    }
}


