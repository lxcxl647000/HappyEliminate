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
    @property(Node)
    setting: Node = null;

    private _currentLevel: Level = null;

    show(option: PanelShowOption): void {
        option.onShowed();

        this._updateLevel(false);
        this._initMap();
    }
    hide(option: PanelHideOption): void {

    }

    protected onEnable(): void {
        qc.eventManager.on(EventDef.Unlock_Map, this._unlockMap, this);
        qc.eventManager.on(EventDef.Update_Level, this._updateLevel, this);
        qc.eventManager.on(EventDef.Jump_Level, this._jumpToLevel, this);
        this.levelLabel.string = `第${PlayerMgr.ins.player.level}关`;
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.Update_Level, this._updateLevel, this);
        qc.eventManager.off(EventDef.Unlock_Map, this._unlockMap, this);
        qc.eventManager.off(EventDef.Jump_Level, this._jumpToLevel, this);
    }

    private _initMap() {
        this.mapList.numItems = PlayerMgr.ins.player.mapId;
        this._jumpToLevel(PlayerMgr.ins.player.mapId, PlayerMgr.ins.player.level);
    }

    private _jumpToLevel(mapId: number, level: number) {
        if (level <= 5) {
            return;
        }
        let total = 0;
        for (let i = 0; i < mapId; i++) {
            total += LevelMgr.ins.getMap(i + 1).size;
        }
        this.mapList.scrollView.scrollToPercentVertical((level) / total);
    }

    public onRenderMap(item: Node, index: number) {
        item.active = true;
        let map = item.getComponent(MapNodeData);
        if (map) {
            map.initLevels(LevelMgr.ins.getMap(index + 1));
        }
    }

    private _updateLevel(needUpdateNext: boolean) {
        if (needUpdateNext) {
            qc.eventManager.emit(EventDef.Active_Next_Level, PlayerMgr.ins.player.level);
        }
        this._currentLevel = LevelMgr.ins.getLevel(PlayerMgr.ins.player.mapId, PlayerMgr.ins.player.level);
        this.levelLabel.string = `第${PlayerMgr.ins.player.level}关`;

        this._jumpToLevel(PlayerMgr.ins.player.mapId, PlayerMgr.ins.player.level);
    }

    private _unlockMap() {
        // qc.eventManager.emit(EventDef.Map_Lock_Status);
        this.mapList.numItems = 0;
        this.mapList.numItems = PlayerMgr.ins.player.mapId;
        setTimeout(() => {
            this.mapList.scrollTo(PlayerMgr.ins.player.mapId - 1);

        }, 500);
        // this.mapList.scrollTo(PlayerMgr.ins.player.mapId - 1);

        this._updateLevel(true);
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
    // 签到
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
    // 我的背包
    backpackBtn() {
        qc.panelRouter.showPanel({
            panel: PanelConfigs.backpackPanel,
            onShowed: () => {
                console.log('this is a backpackBtn');
            },
        });
    }
    // 体力兑换
    exchangeBtn() {
        qc.panelRouter.showPanel({
            panel: PanelConfigs.exchangePanel,
            onShowed: () => {
                console.log('this is a exchangeBtn');
            },
        });
    }

    onSettingBtn() {
        this.setting.active = !this.setting.active;
    }

    onRedPackBtn() {
        qc.panelRouter.showPanel({
            panel: PanelConfigs.redEnvelopePanel,
            onShowed: () => {

            },
        });
    }
    // 任务中心
    taskBtn() {
        qc.panelRouter.showPanel({
            panel: PanelConfigs.taskPanel,
            onShowed: () => {
            },
        });
    }
    // 红包弹窗
    redPackBtn() {
        qc.panelRouter.showPanel({
            panel: PanelConfigs.redEnvelopeModelPanel,
            onShowed: () => {
            },
        });
    }


    private _setBtnsActive() {

    }
}


