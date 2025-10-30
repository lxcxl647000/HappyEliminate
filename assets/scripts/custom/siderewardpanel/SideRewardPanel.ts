import { _decorator, Component, Label, Node } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import CocosUtils from '../../utils/CocosUtils';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import EventDef from '../../constants/EventDef';
const { ccclass, property } = _decorator;

@ccclass('SideRewardPanel')
export class SideRewardPanel extends PanelComponent {
    @property(Label)
    btnLabel: Label = null!

    private _isFromSide: boolean = false;

    protected onEnable(): void {
        qc.eventManager.on(EventDef.OnShow, this._onshow, this);
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.OnShow, this._onshow, this);
    }

    show(option: PanelShowOption): void {
        CocosUtils.openPopAnimation(this.node.getChildByName('SafeArea'), () => {
            option.onShowed();
        });
        this._init();
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    private _init() {
        this._isFromSide = qc.platform.ttLaunch && (qc.platform.ttLaunch.scene === '021036' || qc.platform.ttLaunch.scene === '021012');
        this.btnLabel.string = this._isFromSide ? '领取奖励' : '进入侧边栏';
    }
    onBtnClick() {
        // 领奖
        if (this._isFromSide) {
            qc.eventManager.emit(EventDef.Hide_Side_Reward);
        }
        // 跳到侧边栏
        else {
            qc.platform.navigateToScene('sidebar');
        }
    }

    onClose() {
        qc.panelRouter.hide({ panel: PanelConfigs.sideRewardPanel });
    }

    private _onshow(res: any) {
        this._init();
    }
}
