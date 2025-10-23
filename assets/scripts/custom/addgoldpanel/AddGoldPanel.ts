import { _decorator, Component, Node } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import ListCom from '../../framework/lib/components/scrollviewplus/ListCom';
import { ExchangeTool } from './ExchangeTool';
import { AddGoldItem } from './AddGoldItem';
import { GetGoldConfig } from '../../configs/GetGoldConfig';
import ConfigMgr from '../../manager/ConfigMgr';
import { configConfigs } from '../../configs/configConfigs';
import ItemMgr from '../../manager/ItemMgr';
import CocosUtils from '../../utils/CocosUtils';
const { ccclass, property } = _decorator;

@ccclass('AddGoldPanel')
export class AddGoldPanel extends PanelComponent {
    @property(ListCom)
    list: ListCom = null;
    @property(Node)
    exchangeNode: Node = null;

    private _getGoldDatas: GetGoldConfig[] = [];

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
        this.list.numItems = 0;
        this._initExchangeTools();
        this._initGetGoldList();
    }

    private _initExchangeTools() {
        let index = 0;
        let items = ItemMgr.ins.itemList;
        if (items) {
            for (let item of items) {
                let tool = this.exchangeNode.children[index++];
                tool.getComponent(ExchangeTool).init(item);
            }
        }
    }

    private _initGetGoldList() {
        if (this._getGoldDatas.length === 0) {
            let configs = ConfigMgr.ins.getConfigArr<GetGoldConfig>(configConfigs.getGoldConfig)
            for (let config of configs) {
                this._getGoldDatas.push(config);
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


