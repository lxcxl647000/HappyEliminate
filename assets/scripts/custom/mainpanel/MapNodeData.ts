import { _decorator, Component, instantiate, Label, Layout, Node, ProgressBar } from 'cc';
import { LevelConfig } from '../../configs/LevelConfig';
import { LevelNodeData } from './LevelNodeData';
import PlayerMgr from '../../manager/PlayerMgr';
import { qc } from '../../framework/qc';
import EventDef from '../../constants/EventDef';
import LevelMgr from '../../manager/LevelMgr';
const { ccclass, property } = _decorator;

@ccclass('MapNodeData')
export class MapNodeData extends Component {
    @property(Node)
    levelNode: Node = null;
    @property(Node)
    levels: Node = null;
    @property(Node)
    lock: Node = null;
    @property(Label)
    lockDes: Label = null;
    @property(ProgressBar)
    lockProgress: ProgressBar = null;

    private _mapId: number = -1;

    protected start(): void {
        qc.eventManager.on(EventDef.Unlock_Map, this._setLockStatus, this);
        qc.eventManager.on(EventDef.Update_Stars, this._updateLockDes, this);
    }

    protected onDestroy(): void {
        qc.eventManager.off(EventDef.Unlock_Map, this._setLockStatus, this);
        qc.eventManager.off(EventDef.Update_Stars, this._updateLockDes, this);
    }

    public initLevels(levelMap: Map<number, LevelConfig>) {
        let index = 0;
        let keys = levelMap.keys();
        this._mapId = -1;
        for (let key of keys) {
            let level = levelMap.get(key);
            let lNode = instantiate(this.levelNode);
            lNode.active = true;
            this.levels.children[index++].addChild(lNode);
            lNode.setPosition(0, 0, 0);
            let levelItem = lNode.getComponent(LevelNodeData);
            levelItem.updateLevel(level);
            if (this._mapId === -1) {
                this._mapId = level.mapId;
            }
        }
        this._setLockStatus();
        this._updateLockDes();
    }

    private _setLockStatus() {
        let isActive = this.lock.active;
        let isLock = PlayerMgr.ins.userInfo.summary.map_on === this._mapId;
        if (isActive === false && isLock) {
            let layout = this.node.parent.getComponent(Layout);
            if (layout) {
                layout.enabled = true;
                setTimeout(() => {
                    layout.enabled = false;
                }, 50);
            }
        }
        this.lock.active = isLock;
    }

    private _updateLockDes() {
        if (this.lock.active) {
            let str = '';
            let map = LevelMgr.ins.getMap(this._mapId + 1);
            if (map) {
                let level = map.values().next();
                if (level && level.value.unlock_stars) {
                    str = `收集胜利星${PlayerMgr.ins.userInfo.summary.total_stars}/${level.value.unlock_stars}`;
                    this.lockProgress.progress = PlayerMgr.ins.userInfo.summary.total_stars / level.value.unlock_stars;
                }
            }
            this.lockDes.string = str;
        }
    }
}

