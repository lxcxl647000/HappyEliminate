import { _decorator, Component, Node } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
const { ccclass, property } = _decorator;

@ccclass('GameExitPanel')
export class GameExitPanel extends PanelComponent {
    private _onExit: Function = null;
    private _onReplay: Function = null;
    show(option: PanelShowOption): void {
        option.onShowed();
        this._onExit = option.data.onExit;
        this._onReplay = option.data.onReplay;
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    onExit() {
        this._onExit() && this._onExit();
        this._hidePanel();
    }

    onReplay() {
        this._onReplay() && this._onReplay();
        this._hidePanel();
    }

    onCloseBtn() {
        this._hidePanel();
    }

    private _hidePanel() {
        qc.panelRouter.hide({ panel: PanelConfigs.gameExitPanel });

    }
}


