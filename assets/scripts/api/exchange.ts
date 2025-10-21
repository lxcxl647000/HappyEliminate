import { httpMgr } from "../framework/lib/net/httpMgr";

interface ExchangeData {
    date: string;
    list: ExchangeList[];
}

export interface ExchangeList {
    count: string;
    title: string;
    need: number;
    done: number;
    status: number;
    type: number;
    reward_strength: number;
}

export class strengthApi {
    private static _ins: strengthApi = null;

    private _dataList: ExchangeList[] = [];

    public get taskList(): ExchangeList[] {
        return this._dataList;
    }

    public static get ins() {
        if (this._ins == null) {
            this._ins = new strengthApi();
        }
        return this._ins;
    }

    // 任务列表
    public async getStrengthTasks(cb: Function) {
    let res = await httpMgr.ins.xhrRequest<ExchangeData>('/game/strengthTasks', 'GET');
        if (res && res.data) {
            if (res) {
                this._dataList = res.data.list.filter((item: ExchangeList) => item.status !== 2);
                cb && cb(res.data);
            }
        }
    }

    // 领取体力
    public async strengthTaskClaim(stage: string, cb: Function) {
        let res = await httpMgr.ins.xhrRequest('/game/strengthTaskClaim', 'GET', { stage: stage});
        if (res && res.data) {
            cb && cb(res.data);
        }
    }

    // 观看视频领取体力
    public async strengthClaim(cb: Function) {
        let res = await httpMgr.ins.xhrRequest('/game/strengthClaim', 'GET');
        if (res && res.data) {
            cb && cb(res.data);
        }
    }
}


