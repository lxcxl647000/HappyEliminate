import EventDef from "../constants/EventDef";
import { ItemType } from "../configs/ItemConfig";
import { qc } from "../framework/qc";
import { Constants } from "./Constants";

export interface IPlayer {
    level: number;
    stars: { [level: number]: number };
    mapId: number;
    energy: number;
    gold: number;
    backPack: { [id: number]: number };
}

export default class PlayerMgr {
    private static _instance: PlayerMgr = null;
    public static get ins(): PlayerMgr {
        if (this._instance == null) {
            this._instance = new PlayerMgr();
        }
        return this._instance;
    }

    private _player: IPlayer = null;
    public get player(): IPlayer {
        if (this._player === null) {
            this._player = qc.storage.getObj(Constants.PLAYER_DATA_KEY,
                {
                    level: 1,
                    stars: {},
                    mapId: 1,
                    energy: 100,
                    // energy: 0,
                    gold: 0
                }
            );
        }
        if (!this._player.level) {
            this._player.level = 1;
        }
        if (!this._player.stars) {
            this._player.stars = {};
        }
        if (!this._player.mapId) {
            this._player.mapId = 1;
        }
        if (!this._player.energy) {
            // this._player.energy = 0;
            this._player.energy = 100;
        }
        if (!this._player.gold) {
            this._player.gold = 0;
        }
        if (!this._player.backPack) {
            this._player.backPack = {};
        }
        return this._player;
    }
    public set player(value: IPlayer) {
        this._player = value;
        qc.storage.setObj(Constants.PLAYER_DATA_KEY, this._player);
    }

    public addGold(num: number) {
        this.player.gold += num;
        qc.eventManager.emit(EventDef.Update_Gold);
    }

    public addEnergy(num: number) {
        this.player.energy += num;
        qc.eventManager.emit(EventDef.Update_Energy);
    }

    public getItemNum(itemId: ItemType) {
        return this.player.backPack[itemId] || 0;
    }
}