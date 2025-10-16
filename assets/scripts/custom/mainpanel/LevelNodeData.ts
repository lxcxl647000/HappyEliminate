import { _decorator, Component, Label, Node } from 'cc';
import CustomSprite from '../componetUtils/CustomSprite';
import { LevelConfig } from '../../configs/LevelConfig';
import PlayerMgr from '../../manager/PlayerMgr';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import EventDef from '../../constants/EventDef';
const { ccclass, property } = _decorator;

@ccclass('LevelNodeData')
export class LevelNodeData extends Component {
    @property(Label)
    levelLabel: Label = null;
    @property(Node)
    stars: Node = null;
    @property(CustomSprite)
    levelStatus: CustomSprite = null;

    private _levelData: LevelConfig = null;

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
    }

    onClickLevel() {
        if (this._levelData) {
            if (this._levelData.levelIndex > PlayerMgr.ins.userInfo.summary.latest_passed_level + 1) {
                return;
            }
            qc.panelRouter.showPanel({
                panel: PanelConfigs.gameStartPanel,
                onShowed: () => {

                },
                data: this._levelData
            });
        }
    }

    private _activeLevel(level: number) {
        if (level !== this._levelData.levelIndex) {
            return;
        }
        this.levelStatus.index = PlayerMgr.ins.userInfo.summary.latest_passed_level < this._levelData.levelIndex ? 0 : 1;
    }
}