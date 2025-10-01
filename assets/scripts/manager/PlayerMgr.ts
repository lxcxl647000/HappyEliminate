import EventDef from "../constants/EventDef";
import { ItemType } from "../configs/ItemConfig";
import { qc } from "../framework/qc";
import { Constants } from "../game/Constants";

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
                    // gold: 0
                    gold: 10000
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
            // this._player.gold = 0;
            this._player.gold = 10000;
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

    public addGold(num: number, isStorage: boolean) {
        this.player.gold += num;
        if (this.player.gold < 0) {
            this.player.gold = 0;
        }
        qc.eventManager.emit(EventDef.Update_Gold);
        if (isStorage) {
            qc.storage.setObj(Constants.PLAYER_DATA_KEY, this.player);
        }
    }

    public addEnergy(num: number, isStorage: boolean) {
        this.player.energy += num;
        if (this.player.energy < 0) {
            this.player.energy = 0;
        }
        qc.eventManager.emit(EventDef.Update_Energy);
        if (isStorage) {
            qc.storage.setObj(Constants.PLAYER_DATA_KEY, this.player);
        }
    }

    public getItemNum(itemId: ItemType) {
        return this.player.backPack[itemId] || 0;
    }

    public addItem(itemType: ItemType, num: number, isStorage: boolean) {
        if (itemType < 0) {
            return;
        }
        if (itemType === ItemType.Gold || itemType === ItemType.Energy) {
            if (itemType === ItemType.Gold) {
                this.addGold(num, isStorage);
            } else {
                this.addEnergy(num, isStorage);
            }
            return;
        }
        if (!this.player.backPack[itemType]) {
            this.player.backPack[itemType] = num < 0 ? 0 : num;
        }
        else {
            this.player.backPack[itemType] += num;
            if (this.player.backPack[itemType] < 0) {
                this.player.backPack[itemType] = 0;
            }
        }
        if (isStorage) {
            qc.storage.setObj(Constants.PLAYER_DATA_KEY, this.player);
        }
        qc.eventManager.emit(EventDef.Update_Item, itemType);
    }
}