import { LevelConfig } from "../configs/LevelConfig";
import ConfigMgr from "./ConfigMgr";
import { configConfigs } from "../configs/configConfigs";
import { httpMgr } from "../framework/lib/net/httpMgr";
import { qc } from "../framework/qc";
import { PanelConfigs } from "../configs/PanelConfigs";

export interface PassData {
    latest_passed_level: number;
    passed_levels: number;
    total_stars: number;
    total_score: number;
    pass_status: number;
    rewards: PassReward[];
}

export interface PassReward {
    type: number;
    type_name: string;
    amount: number;
}

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

    public async sendLevelToServer(level: number) {
        await httpMgr.ins.xhrRequest('/game/attemptBegin', 'GET', { level_no: level });
    }

    public async sendLevelPassToServer(level_no: number, stars: number, score: number, map_on: number, cb: Function) {
        let res = await httpMgr.ins.xhrRequest<PassData>('/game/submit', 'GET', { level_no, score, stars, map_on });
        if (res) {
            cb && cb(res.data);
        }
    }

    public goToLevel(mapId: number, level: number, cb: Function, replayCb?: Function, closeCb?: Function) {
        if (level === 0) {
            level += 1;
        }
        let levelConfig = this.getLevel(mapId, level);
        qc.panelRouter.showPanel({
            panel: PanelConfigs.gameStartPanel,
            onShowed: () => {
                cb && cb();
            },
            data: { levelConfig, replayCb, closeCb }
        });
    }

    // 使用金币获得步数
    public async useGoldGetSteps(cb: Function) {
        let res = await httpMgr.ins.xhrRequest<PassData>('/game/revive');
        if (res) {
            cb && cb(res.data);
        }
    }

    // 重玩
    public async replay(level_no: number, cb: Function) {
        let res = await httpMgr.ins.xhrRequest<PassData>('/game/levelReplay', 'GET', { level_no });
        if (res) {
            cb && cb(res.data);
        }
    }
}