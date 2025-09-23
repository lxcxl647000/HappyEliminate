import { _decorator, Component, Label, Node } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import { Level } from '../../game/Level';
import LevelMgr from '../../game/LevelMgr';
import PlayerMgr from '../../game/PlayerMgr';
import EventDef from '../../constants/EventDef';
import ListCom from '../../framework/lib/components/scrollviewplus/ListCom';
import { MapNodeData } from './MapNodeData';
const { ccclass, property } = _decorator;

@ccclass('MainPanel')
export class MainPanel extends PanelComponent {
    @property(Label)
    levelLabel: Label = null;
    @property(ListCom)
    mapList: ListCom = null;

    private _currentLevel: Level = null;

    show(option: PanelShowOption): void {
        option.onShowed();

        this._updateLevel();
        this._initMap();
    }
    hide(option: PanelHideOption): void {

    }

    protected onEnable(): void {
        qc.eventManager.on(EventDef.Update_Level, this._updateLevel, this);
        this.levelLabel.string = `第${PlayerMgr.ins.player.level}关`;
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.Update_Level, this._updateLevel, this);
    }

    private _initMap() {
        this.mapList.numItems = PlayerMgr.ins.player.mapId;
    }

    public onRenderMap(item: Node, index: number) {
        item.active = true;
        let map = item.getComponent(MapNodeData);
        if (map) {
            map.initLevels(LevelMgr.ins.getMap(index + 1));
        }
    }

    private _updateLevel() {
        this._currentLevel = LevelMgr.ins.getLevel(PlayerMgr.ins.player.mapId, PlayerMgr.ins.player.level);
        this.levelLabel.string = `第${PlayerMgr.ins.player.level}关`;
    }

    onStartBtn() {
        qc.panelRouter.showPanel({
            panel: PanelConfigs.gamePanel,
            onShowed: () => {

            },
            data: this._currentLevel
        });
    }
    userInfoBTn() {
        qc.panelRouter.showPanel({
            panel: PanelConfigs.userInfoPanel,
            onShowed: () => {
                console.log('this is a userinfo-----');
            },
        });
    }
    signBtn() {
        qc.panelRouter.showPanel({
            panel: PanelConfigs.signPanel,
            onShowed: () => {
                console.log('this is a signBtn');
            },
        });
    }
    chengjiuBtn() {
        qc.panelRouter.showPanel({
            panel: PanelConfigs.chengjiuPanel,
            onShowed: () => {
                console.log('this is a chengjiuBtn');
            },
        });
    }
}


