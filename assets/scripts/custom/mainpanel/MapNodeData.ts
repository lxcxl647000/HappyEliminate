import { _decorator, Component, instantiate, Label, Node } from 'cc';
import { Level } from '../../game/Level';
import { LevelNodeData } from './LevelNodeData';
import PlayerMgr from '../../game/PlayerMgr';
import { qc } from '../../framework/qc';
import EventDef from '../../constants/EventDef';
const { ccclass, property } = _decorator;

@ccclass('MapNodeData')
export class MapNodeData extends Component {
    @property(Node)
    levelNode: Node = null;
    @property(Node)
    levels: Node = null;
    @property(Node)
    lock: Node = null;

    private _mapId: number = -1;

    protected start(): void {
        qc.eventManager.on(EventDef.Unlock_Map, this._setLockStatus, this);
    }

    protected onDestroy(): void {
        qc.eventManager.off(EventDef.Unlock_Map, this._setLockStatus, this);
    }

    public initLevels(levelMap: Map<number, Level>) {
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
    }

    private _setLockStatus() {
        this.lock.active = PlayerMgr.ins.player.mapId === this._mapId;
    }
}

