import { _decorator, Component, Node } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import ListCom from '../../framework/lib/components/scrollviewplus/ListCom';
const { ccclass, property } = _decorator;

@ccclass('AddGoldPanel')
export class AddGoldPanel extends PanelComponent {
    @property(ListCom)
    list: ListCom = null;

    show(option: PanelShowOption): void {
        option.onShowed();

        this._init();
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    private _init() {

    }

    private _initExchangeTools() {

    }

    private _initGetGoldList() {

    }

    public onRenderGetGoldItem(item: Node, index: number) {

    }

    onCloseClick() {
        this._hidePanel();
    }

    private _hidePanel() {
        qc.panelRouter.hide({ panel: PanelConfigs.addGoldPanel });
    }
}


