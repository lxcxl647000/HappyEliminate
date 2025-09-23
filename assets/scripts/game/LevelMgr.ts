import { assetManager, AssetManager, JsonAsset } from "cc";
import { Level, LevelUtil } from "./Level";
import { BundleConfigs } from "../configs/BundleConfigs";

interface LevelObject {
    levelIndex: number;
    steps: number;
    goal: LevelGoal;
    types: number[];
    gridName: string;
    grid: number[][];
    complete: boolean;
    starCount: number;
    score: number;
    star3score: number;
}

interface LevelGoal {
    type: number;
    value: LevelValue[];
}

interface LevelValue {
    cellType: number;
    counter: number;
}

export default class LevelMgr {
    private static _instance: LevelMgr = null;
    public static get ins(): LevelMgr {
        if (this._instance == null) {
            this._instance = new LevelMgr();
        }
        return this._instance;
    }

    private _levels: Map<number, Level> = new Map();
    // key为地图id//
    private _maps: Map<number, Map<number, Level>> = new Map();
    public getLevel(mapId: number, levelIndex: number): Level {
        let map = this.getMap(mapId);
        if (map) {
            return map.get(levelIndex);
        }
        else {
            return null;
        }
    }
    public getMap(mapId: number) {
        return this._maps.get(mapId);
    }

    public loadLevelData(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let loadBundle = (bundle: AssetManager.Bundle) => {
                bundle.load('level/levels', (error: Error, data: JsonAsset) => {
                    if (error) {
                        console.log('load levels error', error);
                        reject(error);
                    }
                    else {
                        console.log('load levels success', data.json);
                        let levels = LevelUtil.loadFromJson(data);
                        for (let level of levels) {
                            this._levels.set(level.levelIndex, level);
                            if (this._maps.has(level.mapId)) {
                                this._maps.get(level.mapId).set(level.levelIndex, level);
                            }
                            else {
                                let map = new Map<number, Level>();
                                map.set(level.levelIndex, level);
                                this._maps.set(level.mapId, map);
                            }
                        }
                        resolve();
                    }
                });
            };
            let bundle: AssetManager.Bundle = assetManager.getBundle(BundleConfigs.configBundle);
            if (bundle == null) {
                assetManager.loadBundle(BundleConfigs.configBundle, (error: Error, bundle: AssetManager.Bundle) => {
                    loadBundle(bundle);
                });
            } else {
                loadBundle(bundle);
            }
        });
    }
}