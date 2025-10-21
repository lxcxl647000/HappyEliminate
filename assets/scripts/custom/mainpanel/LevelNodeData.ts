import { _decorator, Animation, Component, Label, Node } from 'cc';
import CustomSprite from '../componetUtils/CustomSprite';
import { LevelConfig } from '../../configs/LevelConfig';
import PlayerMgr from '../../manager/PlayerMgr';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import EventDef from '../../constants/EventDef';
import PoolMgr from '../../manager/PoolMgr';
import { BundleConfigs } from '../../configs/BundleConfigs';
import CocosUtils from '../../utils/CocosUtils';
import { Head } from './Head';
import LevelMgr from '../../manager/LevelMgr';
const { ccclass, property } = _decorator;

@ccclass('LevelNodeData')
export class LevelNodeData extends Component {
    @property(Label)
    levelLabel: Label = null;
    @property(Node)
    stars: Node = null;
    @property(CustomSprite)
    levelStatus: CustomSprite = null;
    @property(Node)
    lightNode: Node = null;
    @property(Animation)
    light_di2: Animation = null;
    @property(Animation)
    light_di1: Animation = null;
    @property(Animation)
    light_kuo2: Animation = null;
    @property(Animation)
    light_kuo1: Animation = null;
    @property(Animation)
    levelAni: Animation = null;


    private _levelData: LevelConfig = null;
    public get levelData() { return this._levelData; }

    protected onEnable(): void {
        qc.eventManager.on(EventDef.Update_Stars, this._updateStars, this);
        qc.eventManager.on(EventDef.Active_Next_Level, this._activeLevel, this);
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.Update_Stars, this._updateStars, this);
        qc.eventManager.off(EventDef.Active_Next_Level, this._activeLevel, this);
    }

    private _updateStars(level: number, stars: number) {
        if (level !== this._levelData.levelIndex) {
            return;
        }
        for (let i = 1; i <= this.stars.children.length; i++) {
            let star = this.stars.children[i - 1].getComponent(CustomSprite);
            if (star) {
                star.index = i <= stars ? 1 : 0;
            }
        }
    }

    updateLevel(data: LevelConfig) {
        this._levelData = data;

        this.levelLabel.string = this._levelData.levelIndex.toString();
        this.levelStatus.index = PlayerMgr.ins.userInfo.summary.latest_passed_level < this._levelData.levelIndex ? 0 : 1;
        let levelInfo = PlayerMgr.ins.getLevelsInfo(this._levelData.levelIndex);
        let starCount = levelInfo ? levelInfo.best_stars : 0;
        this._updateStars(this._levelData.levelIndex, starCount);

        // 当前要闯的关
        let isCurLevel = this._levelData.levelIndex === PlayerMgr.ins.userInfo.summary.latest_passed_level + 1;
        if (isCurLevel) {
            this._setHeadTargetPos();
        }
    }

    onClickLevel() {
        if (this._levelData) {
            if (this._levelData.levelIndex > PlayerMgr.ins.userInfo.summary.latest_passed_level + 1) {
                return;
            }
            LevelMgr.ins.goToLevel(this._levelData.mapId, this._levelData.levelIndex, null);
        }
    }

    private _activeLevel(level: number) {
        if (this._levelData.levelIndex === level + 1) {
            this._setHeadTargetPos();
            return;
        }
        else if (level !== this._levelData.levelIndex) {
            return;
        }
        if (level !== this._levelData.levelIndex) {
            return;
        }
        this._playAni(false);
        this.lightNode.active = false;
        this.levelStatus.index = 1;
    }

    private _setHeadTargetPos() {
        let head = this.node.parent.parent.getChildByName('head');
        if (head) {
            let target = head.getChildByName('target');
            if (!target) {
                PoolMgr.ins.getNodeFromPool(BundleConfigs.mainBundle, 'prefabs/Head', (node: Node) => {
                    head.addChild(node);
                    node.name = 'target';
                    node.getComponent(Head).playAni();
                });
            }
            let pos = CocosUtils.setNodeToTargetPos(head, this.node);
            pos.y += 100;
            head.setPosition(pos);
        }
        this.lightNode.active = true;
        this._playAni(true);
    }

    private _playAni(isPlay: boolean) {
        if (isPlay) {
            this.light_di2.play();
            this.light_di1.play();
            this.light_kuo2.play();
            this.light_kuo1.play();
            this.levelAni.play();
        }
        else {
            this.light_di2.stop();
            this.light_di1.stop();
            this.light_kuo2.stop();
            this.light_kuo1.stop();
            this.levelAni.stop();
        }
    }
}