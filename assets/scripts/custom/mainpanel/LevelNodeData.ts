import { _decorator, Component, Label, Node } from 'cc';
import CustomSprite from '../componetUtils/CustomSprite';
import { Level } from '../../game/Level';
import PlayerMgr from '../../game/PlayerMgr';
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

    private _levelData: Level = null;

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

    updateLevel(data: Level) {
        this._levelData = data;

        this.levelLabel.string = this._levelData.levelIndex.toString();
        this.levelStatus.index = PlayerMgr.ins.player.level < this._levelData.levelIndex ? 0 : 1;
        let starCount = PlayerMgr.ins.player.stars[this._levelData.levelIndex] | 0;
        this._updateStars(this._levelData.levelIndex, starCount);
    }

    onClickLevel() {
        if (this._levelData) {
            if (this._levelData.levelIndex > PlayerMgr.ins.player.level) {
                return;
            }
            qc.panelRouter.showPanel({
                panel: PanelConfigs.gamePanel,
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
        this.levelStatus.index = PlayerMgr.ins.player.level < this._levelData.levelIndex ? 0 : 1;
    }
}