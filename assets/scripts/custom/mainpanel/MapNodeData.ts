import { _decorator, Component, instantiate, Label, Node } from 'cc';
import { Level } from '../../game/Level';
import { LevelNodeData } from './LevelNodeData';
import PlayerMgr from '../../game/PlayerMgr';
const { ccclass, property } = _decorator;

@ccclass('MapNodeData')
export class MapNodeData extends Component {
    @property(Node)
    levelNode: Node = null;
    @property(Node)
    levels: Node = null;
    @property(Node)
    lock: Node = null;

    public initLevels(levelMap: Map<number, Level>) {
        let index = 0;
        let keys = levelMap.keys();
        let mapId = -1;
        for (let key of keys) {
            let level = levelMap.get(key);
            let lNode = instantiate(this.levelNode);
            lNode.active = true;
            this.levels.children[index++].addChild(lNode);
            lNode.setPosition(0, 0, 0);
            let levelItem = lNode.getComponent(LevelNodeData);
            levelItem.updateLevel(level);
            if (mapId === -1) {
                mapId = level.mapId;
            }
        }
        this.lock.active = mapId === PlayerMgr.ins.player.mapId;
    }
}

