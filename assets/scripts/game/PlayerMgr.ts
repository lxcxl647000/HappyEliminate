import { qc } from "../framework/qc";
import { Constants } from "./Constants";

export interface IPlayer {
    level: number;
    stars: { [level: number]: number };
    mapId: number;
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
                    mapId: 1
                }
            );
        }
        return this._player;
    }
    public set player(value: IPlayer) {
        this._player = value;
        qc.storage.setObj(Constants.PLAYER_DATA_KEY, this._player);
    }
}