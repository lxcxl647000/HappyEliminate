import { LevelConfig } from "../configs/LevelConfig";
import ConfigMgr from "./ConfigMgr";
import { configConfigs } from "../configs/configConfigs";

export default class LevelMgr {
    private static _instance: LevelMgr = null;
    public static get ins(): LevelMgr {
        if (this._instance == null) {
            this._instance = new LevelMgr();
        }
        return this._instance;
    }

    private _levels: Map<number, LevelConfig> = new Map();
    // key为地图id//
    private _maps: Map<number, Map<number, LevelConfig>> = null;
    public getLevel(mapId: number, levelIndex: number): LevelConfig {
        let map = this.getMap(mapId);
        if (map) {
            return map.get(levelIndex);
        }
        else {
            return null;
        }
    }
    public getMap(mapId: number) {
        if (!this._maps) {
            this._maps = new Map();
            let levels = ConfigMgr.ins.getConfigArr<LevelConfig>(configConfigs.levelConfig);
            if (levels) {
                for (let level of levels) {
                    this._levels.set(level.levelIndex, level);
                    if (this._maps.has(level.mapId)) {
                        this._maps.get(level.mapId).set(level.levelIndex, level);
                    }
                    else {
                        let map = new Map<number, LevelConfig>();
                        map.set(level.levelIndex, level);
                        this._maps.set(level.mapId, map);
                    }
                }
            }
        }
        return this._maps.get(mapId);
    }
}