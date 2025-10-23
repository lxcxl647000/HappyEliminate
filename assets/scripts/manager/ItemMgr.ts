import { httpMgr } from "../framework/lib/net/httpMgr";

export interface IItem {
    id: number;
    type: string;
    name: string;
    price: number;
}

export default class ItemMgr {
    private _itemList: IItem[] = [];
    public get itemList() {
        return this._itemList;
    }
    private static _ins: ItemMgr = null;
    public static get ins() {
        if (this._ins == null) {
            this._ins = new ItemMgr();
        }
        return this._ins;
    }

    public getItem(id: number) {
        if (!this._itemList) {
            return null;
        }
        for (let item of this._itemList) {
            if (item.id == id) {
                return item;
            }
        }
        return null;
    }

    public async getItemList(cb: Function) {
        let res = await httpMgr.ins.xhrRequest('/game/props');
        if (res) {
            this._itemList = res.data as IItem[];
            cb && cb();
        }
    }

    public async exchangeItem(type: string, num: number, cb: Function) {
        let res = await httpMgr.ins.xhrRequest('/game/propExchange', 'GET', { type, num });
        if (res) {
            cb && cb(res.data);
        }
    }

    public async useItem(type: string, level_no: number, cb: Function) {
        let res = await httpMgr.ins.xhrRequest('/game/propUse', 'GET', { type, level_no });
        if (res) {
            cb && cb(res.data);
        }
    }

    public async getItemByAd(type: string, cb: Function) {
        let res = await httpMgr.ins.xhrRequest('/game/propVideo', 'GET', { type });
        if (res) {
            cb && cb(res.data);
        }
    }
}