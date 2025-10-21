import { _decorator, Animation, Component, EditBox, Node } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';

import { PanelConfigs } from '../../configs/PanelConfigs';

const { ccclass, property } = _decorator;

@ccclass('loadingPanel')
export class loadingPanel extends PanelComponent {
    @property(Node)
    animation: Node = null;
    show(option: PanelShowOption): void {
        option.onShowed();
        // this.animation.getComponent(Animation).play()
        this.animation.getComponent(Animation).on(Animation.EventType.FINISHED, () => {
            // qc.panelRouter.show({ panel: option.panel });
        })
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    onClose() {
        qc.panelRouter.hide({ panel: PanelConfigs.gmPanel });
    }




}


