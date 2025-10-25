import { httpMgr } from "../framework/lib/net/httpMgr";

export interface ICashData {
    amount: string;
    daily_limit: number;
    used_today: number;
    unlocked: number;
}

export interface ICash {
    list: ICashData[];
    account: IAccount;
    stats: IStats;
}

interface IStats {
    loginStreak: number;
    adWatch: number;
    taskTotal: number;
    latestPassedLevel: number;
}

interface IAccountData {
    account: IAccount;
}

interface IAccount {
    real_name: string;
    alipay_account: string;
}

export default class CashMgr {
    private _cashData: ICash = null;
    public get cashData() { return this._cashData; }

    private static _ins: CashMgr = null;
    public static get ins() {
        if (this._ins == null) {
            this._ins = new CashMgr();
        }
        return this._ins;
    }

    public async requestCashData(cb: Function) {
        let res = await httpMgr.ins.xhrRequest<ICash>('/game/withdrawConfig');
        if (res) {
            this._cashData = res.data;
            cb && cb(true);
        }
        else {
            cb && cb(false);
        }
    }

    public async requestSaveDefaultAccount(account: string, real_name, cb: Function) {
        let res = await httpMgr.ins.xhrRequest<IAccountData>('/game/withdrawSaveAccount', 'GET', { alipay_account: account, real_name });
        if (res) {
            this._cashData.account = res.data.account;
            cb && cb();
        }
    }

    public async requestCash(amount: string, alipayAccount: string, realName: string, cb: Function) {
        let res = await httpMgr.ins.xhrRequest('/game/withdraw', 'GET', { amount, realName, alipayAccount });
        if (res) {
            cb && cb(res);
        }
    }

}