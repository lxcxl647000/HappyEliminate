import { _decorator, Animation, Component, Label, Node, tween } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import { LevelConfig } from '../../configs/LevelConfig';
import LevelMgr from '../../manager/LevelMgr';
import PlayerMgr from '../../manager/PlayerMgr';
import EventDef from '../../constants/EventDef';
import ListCom from '../../framework/lib/components/scrollviewplus/ListCom';
import { MapNodeData } from './MapNodeData';
import { baseConfig } from '../../configs/baseConfig';
import ItemMgr from '../../manager/ItemMgr';
import { musicMgr } from '../../manager/musicMgr';
import CustomSprite from '../componetUtils/CustomSprite';
import { SettingMgr } from '../../manager/SettingMgr';

const { ccclass, property } = _decorator;

@ccclass('MainPanel')
export class MainPanel extends PanelComponent {
    @property(Label)
    levelLabel: Label = null;
    @property(ListCom)
    mapList: ListCom = null;
    @property(Node)
    setting: Node = null;
    @property(Node)
    gm: Node = null;
    @property(Node)
    flyRedPack: Node = null;
    @property(Node)
    flyToTarget: Node = null;
    @property(CustomSprite)
    soundSprite: CustomSprite = null;
    @property(CustomSprite)
    musicSprite: CustomSprite = null;
    @property(Animation)
    startBtnAni: Animation = null;
    @property(Animation)
    fingerAni: Animation = null;
    @property(CustomSprite)
    vibrateSprite: CustomSprite = null;
    @property(Label)
    leftLevelLabel: Label = null;

    private _currentLevel: LevelConfig = null;
    private _vibrateFlag = false;

    show(option: PanelShowOption): void {
        if (!this._vibrateFlag) {
            this._vibrateFlag = true;
            qc.platform.vibrateShort();
        }
        qc.platform.reportScene(304);
        musicMgr.ins.playMusic('bg_music');
        option.onShowed();
        if (PlayerMgr.ins.userInfo.prompt.show == 1) {
            this.redPackBtn()
        }
        qc.platform.fromOtherAppToShowAd();
        this.gm.active = baseConfig.gm;
        this._updateLevel(false);
        this._initMap();
        ItemMgr.ins.getItemList(null);
        this._updateLeftLevelLabel();
    }
    hide(option: PanelHideOption): void {

    }

    protected onEnable(): void {
        qc.eventManager.on(EventDef.Unlock_Map, this._unlockMap, this);
        qc.eventManager.on(EventDef.Update_Level, this._updateLevel, this);
        qc.eventManager.on(EventDef.Jump_Level, this._jumpToLevel, this);
        qc.eventManager.on(EventDef.GamePanelToMainPanel, this._gamePanelToMainPanel, this);
        qc.eventManager.on(EventDef.FlyRedPackAnimation, this._flyRedPackAnimation, this);
        qc.eventManager.on(EventDef.UpdateSoundStatus, this._updateSoundStatus, this);
        qc.eventManager.on(EventDef.UpdateMusicStatus, this._updateMusicStatus, this);
        qc.eventManager.on(EventDef.UpdateVibrateStatus, this._updateVibrateStatus, this);
        qc.eventManager.on(EventDef.Update_Left_Level_Redpack, this._updateLeftLevelLabel, this);
        this.levelLabel.string = `第${PlayerMgr.ins.userInfo.summary.latest_passed_level + 1}关`;
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.Update_Level, this._updateLevel, this);
        qc.eventManager.off(EventDef.Unlock_Map, this._unlockMap, this);
        qc.eventManager.off(EventDef.Jump_Level, this._jumpToLevel, this);
        qc.eventManager.off(EventDef.GamePanelToMainPanel, this._gamePanelToMainPanel, this);
        qc.eventManager.off(EventDef.FlyRedPackAnimation, this._flyRedPackAnimation, this);
        qc.eventManager.off(EventDef.UpdateSoundStatus, this._updateSoundStatus, this);
        qc.eventManager.off(EventDef.UpdateVibrateStatus, this._updateVibrateStatus, this);
        qc.eventManager.off(EventDef.UpdateMusicStatus, this._updateMusicStatus, this);
        qc.eventManager.off(EventDef.Update_Left_Level_Redpack, this._updateLeftLevelLabel, this);
    }

    private _initMap() {
        let level = PlayerMgr.ins.userInfo.summary.latest_passed_level + 1;
        let mapId = PlayerMgr.ins.userInfo.summary.map_on;
        this.mapList.numItems = mapId;
        this._jumpToLevel(mapId, level);

        this._showGuide();
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
        let level = PlayerMgr.ins.userInfo.summary.latest_passed_level;
        let nextLevel = level + 1;
        let mapId = PlayerMgr.ins.userInfo.summary.map_on;
        if (needUpdateNext) {
            qc.eventManager.emit(EventDef.Active_Next_Level, level);
        }
        this._currentLevel = LevelMgr.ins.getLevel(mapId, nextLevel);
        this.levelLabel.string = `第${nextLevel}关`;

        this._jumpToLevel(mapId, nextLevel);
    }

    private _unlockMap() {
        // qc.eventManager.emit(EventDef.Map_Lock_Status);
        let mapId = PlayerMgr.ins.userInfo.summary.map_on;
        this.mapList.numItems = 0;
        this.mapList.numItems = mapId;
        setTimeout(() => {
            this.mapList.scrollTo(mapId - 1);

        }, 500);
        // this.mapList.scrollTo(PlayerMgr.ins.player.mapId - 1);

        this._updateLevel(true);
    }

    onStartBtn() {
        qc.platform.vibrateShort();
        qc.panelRouter.showPanel({
            panel: PanelConfigs.gameStartPanel,
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
            data: { type: 0 }
        });
    }


    private _setBtnsActive() {

    }

    onGoldBtn() {
        qc.panelRouter.showPanel({
            panel: PanelConfigs.addGoldPanel,
            onShowed: () => {
            },
        });
    }

    onLuckyTurntableBtn() {
        qc.panelRouter.showPanel({
            panel: PanelConfigs.luckyTurntablePanel,
            onShowed: () => {
            },
        });
    }

    onGM() {
        qc.panelRouter.showPanel({
            panel: PanelConfigs.gmPanel,
            onShowed: () => {
            },
        });
    }

    onCashBtn() {
        qc.panelRouter.showPanel({
            panel: PanelConfigs.cashPanel,
            onShowed: () => {
            },
        })
    }

    private async _gamePanelToMainPanel() {
        await PlayerMgr.ins.getHomeData();
        if (PlayerMgr.ins.userInfo.prompt.show == 1 && PlayerMgr.ins.userInfo.prompt.type == 2 && PlayerMgr.ins.userInfo.prompt.can_open == 1) {
            this.redPackBtn();
        }
    }

    private _flyRedPackAnimation() {
        // PoolMgr.ins.getNodeFromPool(BundleConfigs.commonBundle, 'prefabs/FlyRedPack', (node: Node) => {
        //     let toPos = CocosUtils.setNodeToTargetPos(node, this.flyToTarget);
        //     this.flyRedPack.addChild(node);
        //     tween(node)
        //         .to(1.7, { position: toPos })
        //         .call(() => {
        //             PoolMgr.ins.putNodeToPool(node);
        //         });
        // });
    }

    onMusic() {
        if (this.musicSprite.index === 0) {
            musicMgr.ins.stopMusic();
            SettingMgr.ins.musicEnabled = false;
            SettingMgr.ins.initMusic();
        }
        else {
            SettingMgr.ins.musicEnabled = true;
            SettingMgr.ins.initMusic();
            musicMgr.ins.playMusic('bg_music');
        }
        qc.eventManager.emit(EventDef.UpdateMusicStatus);
    }

    onSound() {
        if (this.soundSprite.index === 0) {
            SettingMgr.ins.soundEnabled = false;
            SettingMgr.ins.initSound();
        }
        else {
            SettingMgr.ins.soundEnabled = true;
            SettingMgr.ins.initSound();
        }
        qc.eventManager.emit(EventDef.UpdateSoundStatus);
    }

    private _showGuide() {
        this.startBtnAni.play('startBtn');
        this.fingerAni.play('guide_click');
    }

    private _updateSoundStatus() {
        this.soundSprite.index = SettingMgr.ins.soundEnabled ? 0 : 1;
    }

    private _updateMusicStatus() {
        this.musicSprite.index = SettingMgr.ins.musicEnabled ? 0 : 1;
    }

    onVibrate() {
        if (this.vibrateSprite.index === 0) {
            SettingMgr.ins.vibrateEnabled = false;
        }
        else {
            SettingMgr.ins.vibrateEnabled = true;
        }
        qc.eventManager.emit(EventDef.UpdateVibrateStatus);
    }

    private _updateVibrateStatus() {
        this.vibrateSprite.index = SettingMgr.ins.vibrateEnabled ? 0 : 1;
    }

    // 主题弹窗
    bgztBtn() {
        qc.panelRouter.showPanel({
            panel: PanelConfigs.bgztPanel,
            onShowed: () => {
            },
            data: { type: 0 }
        });
    }

    private _updateLeftLevelLabel() {
        let leftLevel = PlayerMgr.ins.userInfo.prompt.remain;
        this.leftLevelLabel.string = `只差${leftLevel}关得红包`;
    }
}