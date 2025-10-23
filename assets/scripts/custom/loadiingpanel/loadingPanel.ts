import { _decorator, Animation, Component, EditBox, Node } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';

import { PanelConfigs } from '../../configs/PanelConfigs';
import EventDef from '../../constants/EventDef';

const { ccclass, property } = _decorator;

@ccclass('loadingPanel')
export class loadingPanel extends PanelComponent {
    @property(Node)
    animation: Node = null;

    protected onEnable(): void {
        qc.eventManager.on(EventDef.Close_Loading, this.onClose, this);
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.Close_Loading, this.onClose, this);
    }

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
        qc.panelRouter.hide({ panel: PanelConfigs.loadingPanel });
    }
}


