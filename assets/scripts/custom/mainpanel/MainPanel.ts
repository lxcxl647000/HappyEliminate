import { _decorator, Animation, Label, Node, Sprite, tween, Vec3, Widget } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import { LevelConfig } from '../../configs/LevelConfig';
import LevelMgr from '../../manager/LevelMgr';
import PlayerMgr from '../../manager/PlayerMgr';
import EventDef from '../../constants/EventDef';
import ListCom from '../../framework/lib/components/scrollviewplus/ListCom';
import { MapNodeData } from './MapNodeData';
import ItemMgr from '../../manager/ItemMgr';
import { musicMgr } from '../../manager/musicMgr';
import CustomSprite from '../componetUtils/CustomSprite';
import { SettingMgr } from '../../manager/SettingMgr';
import CocosUtils from '../../utils/CocosUtils';
import { BundleConfigs } from '../../configs/BundleConfigs';
import { LevelNodeData } from './LevelNodeData';
import PoolMgr from '../../manager/PoolMgr';
import GuideMgr from '../../manager/GuideMgr';
import { PlatformConfig } from '../../framework/lib/platform/configs/PlatformConfig';
import adapter from '../../framework/lib/platform/adapter/adapter';

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
    @property(Node)
    forceGuide: Node = null;
    @property(Node)
    sideRewardBtn: Node = null;

    private _maskSprite: Sprite = null;
    private _currentLevel: LevelConfig = null;
    private _vibrateFlag = false;
    private _musicCD: number = 0;
    private _soundCD: number = 0;
    private _vibrateCD: number = 0;

    protected update(dt: number): void {
        if (this._musicCD > 0) {
            this._musicCD -= dt;
            if (this._musicCD < 0) {
                this._musicCD = 0;
            }
        }
        if (this._soundCD > 0) {
            this._soundCD -= dt;
            if (this._soundCD < 0) {
                this._soundCD = 0;
            }
        }
        if (this._vibrateCD > 0) {
            this._vibrateCD -= dt;
            if (this._vibrateCD < 0) {
                this._vibrateCD = 0;
            }
        }
    }

    show(option: PanelShowOption): void {
        if (adapter.inst.onTaobao() && !this._vibrateFlag) {
            this._vibrateFlag = true;
            qc.platform.vibrateShort();
        }
        qc.platform.reportScene(304);
        musicMgr.ins.playMusic('bg_music');
        option.onShowed();
        if (PlayerMgr.ins.userInfo.prompt.show == 1) {
            this.redPackBtn()
        }
        qc.platform.fromOtherAppToCompleteTask('ad');
        this.gm.active = PlatformConfig.ins.config.gm;
        this._updateLevel(false);
        this._updateTheme(PlayerMgr.ins.userInfo.summary.current_theme_id, () => {
            this._initMap();
        });
        ItemMgr.ins.getItemList(null);
        this._updateLeftLevelLabel();
        this._updateMusicStatus();
        this._updateSoundStatus();
        this._updateVibrateStatus();
        GuideMgr.ins.checkMainPanelForceGuide(this.forceGuide);
        this._onshow();
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
        qc.eventManager.on(EventDef.Update_Theme, this._updateTheme, this);
        qc.eventManager.on(EventDef.OnShow, this._onshow, this);
        qc.eventManager.on(EventDef.OnHide, this._onhide, this);
        qc.eventManager.on(EventDef.Hide_Side_Reward, this._updateSideReward, this);
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
        qc.eventManager.off(EventDef.Update_Theme, this._updateTheme, this);
        qc.eventManager.off(EventDef.OnShow, this._onshow, this);
        qc.eventManager.off(EventDef.OnHide, this._onhide, this);
        qc.eventManager.off(EventDef.Hide_Side_Reward, this._updateSideReward, this);
    }

    private _initMap() {
        let level = PlayerMgr.ins.userInfo.summary.latest_passed_level + 1;
        let mapId = PlayerMgr.ins.userInfo.summary.map_on;
        let levelData = LevelMgr.ins.getLevel(mapId, level);
        if (!levelData) {
            level = PlayerMgr.ins.userInfo.summary.latest_passed_level;
        }
        this.mapList.numItems = mapId;
        this._jumpToLevel(mapId, level);

        this._showGuide();
    }

    private _jumpToLevel(mapId: number, level: number) {
        this.mapList.scrollTo(mapId - 1, 0.1);
        this.scheduleOnce(() => {
            let children = this.mapList.content.children;
            let lvPosNode: Node = null;
            let bottomNode: Node = null;
            for (let child of children) {
                let mapData = child.getComponent(MapNodeData);
                if (mapData) {
                    let levelsPosNode = mapData.levels;
                    for (let levelNode of levelsPosNode.children) {
                        let levelData = levelNode.getComponentInChildren(LevelNodeData);
                        if (levelData && levelData.levelData.lvID === level) {
                            lvPosNode = levelNode;
                            break;
                        }
                    }
                }
            }
            if (lvPosNode) {
                bottomNode = lvPosNode.parent.getChildByName('bottom');
                if (bottomNode) {
                    let offsetY = bottomNode.position.y - lvPosNode.position.y;
                    let pos = this.mapList.scrollView.content.position;
                    tween(this.mapList.scrollView.content)
                        .to(0.2, { position: new Vec3(pos.x, pos.y + offsetY, pos.z) }, { easing: 'sineInOut' })
                        .call(() => {
                            this.mapList.scrollView.enabled = false;
                            this.mapList.scrollView.enabled = true;
                        })
                        .start();
                }
            }
        }, .1);
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
        if (!this._currentLevel) {
            this._currentLevel = LevelMgr.ins.getLevel(mapId, level);
        }
        this.levelLabel.string = `第${this._currentLevel.lvID}关`;

        needUpdateNext && this._jumpToLevel(mapId, this._currentLevel.lvID);
    }

    private _unlockMap() {
        // qc.eventManager.emit(EventDef.Map_Lock_Status);
        let mapId = PlayerMgr.ins.userInfo.summary.map_on;
        this.mapList.numItems = 0;
        this.mapList.numItems = mapId;
        setTimeout(() => {
            this.mapList.scrollTo(mapId - 1);

        }, 200);
        // this.mapList.scrollTo(PlayerMgr.ins.player.mapId - 1);

        this._updateLevel(true);
    }

    onStartBtn() {
        qc.platform.vibrateShort();
        LevelMgr.ins.goToLevel(this._currentLevel.mapId, this._currentLevel.lvID, null);
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
        qc.panelRouter.showPanelWithLoading({
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
        qc.panelRouter.showPanelWithLoading({
            panel: PanelConfigs.redEnvelopePanel
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
        qc.panelRouter.showPanelWithLoading({
            panel: PanelConfigs.cashPanel
        });
    }

    private async _gamePanelToMainPanel() {
        await PlayerMgr.ins.getHomeData();
        if (PlayerMgr.ins.userInfo.prompt.show == 1 && PlayerMgr.ins.userInfo.prompt.type == 2 && PlayerMgr.ins.userInfo.prompt.can_open == 1) {
            this.redPackBtn();
        }
        GuideMgr.ins.checkMainPanelForceGuide(this.forceGuide);
    }

    private _flyRedPackAnimation(addCash: number) {
        PoolMgr.ins.getNodeFromPool(BundleConfigs.commonBundle, 'prefabs/FlyRedPack', (node: Node) => {
            node.setScale(0.2, 0.2);
            node.setRotationFromEuler(0, 0, 8);
            this.flyRedPack.addChild(node);
            node.setPosition(0, 0);

            let toPos = CocosUtils.setNodeToTargetPos(node, this.flyToTarget);
            tween(node)
                .to(53 / 30, { position: toPos }, { easing: 'sineInOut' })
                .start();
            tween(node)
                .to(3 / 30, { scale: new Vec3(.7, .7, 1) }, { easing: 'sineInOut' })
                .to(3 / 30, { scale: new Vec3(.8, .8, 1) }, { easing: 'sineInOut' })
                .to(2 / 30, { scale: new Vec3(.8, .8, 1) }, { easing: 'sineInOut' })
                .to(3 / 30, { scale: new Vec3(1.1, 1.1, 1) }, { easing: 'sineInOut' })
                .to(2 / 30, { scale: new Vec3(1.1, 1.1, 1) }, { easing: 'sineInOut' })
                .to(3 / 30, { scale: new Vec3(1.2, 1.2, 1) }, { easing: 'sineInOut' })
                .to(11 / 30, { scale: new Vec3(.8, .8, 1) }, { easing: 'sineInOut' })
                .to(6 / 30, { scale: new Vec3(.6, .6, 1) }, { easing: 'sineInOut' })
                .to(10 / 30, { scale: new Vec3(.4, .4, 1) }, { easing: 'sineInOut' })
                .to(10 / 30, { scale: new Vec3(.27, .27, 1) }, { easing: 'sineInOut' })
                .call(() => {
                    PlayerMgr.ins.addCash(addCash);
                    PoolMgr.ins.putNodeToPool(node);
                })
                .start();
            tween(node)
                .to(46 / 30, { eulerAngles: new Vec3(0, 0, 0) }, { easing: 'sineInOut' })
                .start();
        });
    }

    onMusic() {
        if (this._musicCD) {
            return;
        }
        this._musicCD = .5;
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
        if (this._soundCD) {
            return;
        }
        this._soundCD = .5;
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
        if (this._vibrateCD) {
            return;
        }
        this._vibrateCD = .5;
        if (this.vibrateSprite.index === 0) {
            SettingMgr.ins.vibrateEnabled = false;
        }
        else {
            SettingMgr.ins.vibrateEnabled = true;
            qc.platform.vibrateShort();
        }
        qc.eventManager.emit(EventDef.UpdateVibrateStatus);
    }

    private _updateVibrateStatus() {
        this.vibrateSprite.index = SettingMgr.ins.vibrateEnabled ? 0 : 1;
    }

    // 主题弹窗
    bgztBtn() {
        qc.panelRouter.showPanelWithLoading({
            panel: PanelConfigs.bgztPanel,
            onShowed: () => {
            },
            data: { type: 0 }
        });
    }

    private _updateLeftLevelLabel() {
        let leftLevel = PlayerMgr.ins.userInfo.prompt.open_level - PlayerMgr.ins.userInfo.summary.latest_passed_level;
        this.leftLevelLabel.node.parent.active = leftLevel > 0;
        if (leftLevel > 0) {
            this.leftLevelLabel.string = `只差${leftLevel}关得红包`;
        }
    }

    private _updateTheme(theme_id: string, cb?: Function) {
        if (!this._maskSprite) {
            this._maskSprite = this.node.getChildByName('mask').getComponent(Sprite);
        }
        CocosUtils.loadTextureFromBundle(BundleConfigs.mainBundle, `textures/mask_${theme_id}`, this._maskSprite, () => {
            this._maskSprite.getComponent(Widget).updateAlignment();
            cb && cb();
        });
    }

    setSetting() {
        if (this.setting.active) {
            this.setting.active = false;
        }
    }

    private async _onshow(res?: any, isFirstShow?: boolean) {
        qc.platform.checkScene((isExist: boolean) => {
            this._updateSideReward(isExist);
        });
        if (!isFirstShow) {
            this._musicCD = 1;
            this._soundCD = 1;
            this._vibrateCD = 1;
            if (SettingMgr.ins.musicEnabled) {
                let music = musicMgr.ins.curMusic === '' ? 'bg_music' : musicMgr.ins.curMusic;
                musicMgr.ins.playMusic(music);
            }
            await PlayerMgr.ins.getHomeData();
            PlayerMgr.ins.getEnergy();
            qc.eventManager.emit(EventDef.Update_RewardCount);
        }
    }

    private _onhide() {
        PlayerMgr.ins.clearTime();
        musicMgr.ins.stopMusic();
    }

    onSideReward() {
        qc.panelRouter.showPanel({
            panel: PanelConfigs.sideRewardPanel,
        });
    }

    private _updateSideReward(isActive: boolean) {
        this.sideRewardBtn.active = isActive;
    }
}