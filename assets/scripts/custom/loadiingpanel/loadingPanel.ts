import { _decorator, Animation, Color, Sprite, tween } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';

import { PanelConfigs } from '../../configs/PanelConfigs';
import EventDef from '../../constants/EventDef';

const { ccclass, property } = _decorator;

@ccclass('loadingPanel')
export class loadingPanel extends PanelComponent {
    @property(Animation)
    animation: Animation = null;
    @property(Animation)
    huawen1: Animation = null;
    @property(Animation)
    huawen2: Animation = null;

    protected onEnable(): void {
        qc.eventManager.on(EventDef.Close_Loading, this.onClose, this);
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.Close_Loading, this.onClose, this);
    }

    show(option: PanelShowOption): void {
        option.onShowed();
        this.animation.once(Animation.EventType.FINISHED, () => {
            this.animation.play('loadingLoop');
            let { cb } = option.data;
            cb && cb();
        });
        this.animation.play('loadingNode');
        this.huawen1.play('loadingHuawen');
        this.huawen2.play('loadingHuawen2');
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    onClose() {
        this.huawen1.stop();
        this.huawen2.stop();
        tween(this.huawen1.node.getComponent(Sprite))
            .to(5 / 30, { color: new Color(255, 255, 255, 0) }, { easing: 'sineInOut' })
            .start();
        tween(this.huawen2.node.getComponent(Sprite))
            .to(5 / 30, { color: new Color(255, 255, 255, 0) }, { easing: 'sineInOut' })
            .start();
        this.animation.play('loadingClose');
        this.animation.once(Animation.EventType.FINISHED, () => {
            qc.panelRouter.hide({ panel: PanelConfigs.loadingPanel });
        });
    }
}


