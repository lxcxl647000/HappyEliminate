import { _decorator, Color, instantiate, Label, Node, Sprite, UITransform } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';

const { ccclass, property } = _decorator;

@ccclass('bgztpanel')
export class bgztpanel extends PanelComponent {
    start() {

    }
    show(option: PanelShowOption): void {
        option.onShowed();

    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }
    update(deltaTime: number) {

    }
}


