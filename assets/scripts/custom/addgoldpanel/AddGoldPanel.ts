import { _decorator, Component, Node } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import ListCom from '../../framework/lib/components/scrollviewplus/ListCom';
import { ExchangeToolConfig } from '../../configs/ExchangeToolConfig';
import { ExchangeData, ExchangeTool } from './ExchangeTool';
import { GetGoldConfig } from '../../configs/GetGoldConfig';
import { AddGoldData, AddGoldItem } from './AddGoldItem';
const { ccclass, property } = _decorator;

@ccclass('AddGoldPanel')
export class AddGoldPanel extends PanelComponent {
    @property(ListCom)
    list: ListCom = null;
    @property(Node)
    exchangeNode: Node = null;

    private _getGoldDatas: AddGoldData[] = [];

    show(option: PanelShowOption): void {
        option.onShowed();

        this._init();
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    private _init() {
        this._initExchangeTools();
        this._initGetGoldList();
    }

    private _initExchangeTools() {
        let index = 0;
        for (let key in ExchangeToolConfig) {
            let tool = this.exchangeNode.children[index++];
            tool.getComponent(ExchangeTool).init(ExchangeToolConfig[key] as ExchangeData);
        }
    }

    private _initGetGoldList() {
        if (this._getGoldDatas.length === 0) {
            for (let key in GetGoldConfig) {
                this._getGoldDatas.push(GetGoldConfig[key] as AddGoldData);
            }
        }
        this.list.numItems = this._getGoldDatas.length;
    }

    public onRenderGetGoldItem(item: Node, index: number) {
        let getGold = item.getComponent(AddGoldItem);
        if (getGold) {
            getGold.init(this._getGoldDatas[index]);
        }
    }

    onCloseClick() {
        this._hidePanel();
    }

    private _hidePanel() {
        qc.panelRouter.hide({ panel: PanelConfigs.addGoldPanel });
    }
}


