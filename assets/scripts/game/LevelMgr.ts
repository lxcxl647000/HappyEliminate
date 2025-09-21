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

    private _levels: Level[] = null;
    public get levels(): Level[] {
        return this._levels;
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
                        this._levels = LevelUtil.loadFromJson(data);
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