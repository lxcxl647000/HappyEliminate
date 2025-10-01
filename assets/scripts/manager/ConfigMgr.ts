import { JsonAsset } from "cc";
import { configConfigs } from "../configs/configConfigs";
import CocosUtils from "../utils/CocosUtils";
import { BundleConfigs } from "../configs/BundleConfigs";


export default class ConfigMgr {
    private _configsMap: Map<string, any> = new Map();

    private static _ins: ConfigMgr = null;
    public static get ins() {
        if (this._ins == null) {
            this._ins = new ConfigMgr();
        }
        return this._ins;
    }

    public loadConfigs(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let paths = Object.keys(configConfigs);
            let count = paths.length;
            if (count === 0) {
                resolve();
            }
            else {
                for (let key of paths) {
                    let path = configConfigs[key];
                    CocosUtils.loadFromBundle<JsonAsset>(BundleConfigs.configBundle, path, JsonAsset).then((data: JsonAsset) => {
                        if (data) {
                            this._configsMap.set(path, data.json);
                        }
                        if (--count === 0) {
                            resolve();
                        }
                    });
                }
            }
        });
    }

    public getConfig<T>(key: string, value: string | number, property: string = 'id'): T {
        let configArr = this._configsMap.get(key) as T[];
        if (configArr) {
            for (let config of configArr)
                if (config.hasOwnProperty(property) && config[property] === value) {
                    return config;
                }
        }
        return null;
    }

    public getConfigArr<T>(key: string): T[] {
        return this._configsMap.get(key) as T[];
    }
}