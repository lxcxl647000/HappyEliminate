import { httpMgr } from "../framework/lib/net/httpMgr";

export default class SignApi {
    private static _instance: SignApi = null;
    public static get ins(): SignApi {
        if (this._instance == null) {
            this._instance = new SignApi();
        }
        return this._instance;
    }
    // 礼包列表
    public async getGiftList(cb: Function) {
        let res = await httpMgr.ins.xhrRequest('/Gift/getGiftList', 'GET');
        if (res && res.data) {
            cb && cb(res.data);
        }
    }
    // 领取礼包
    public async receiveGift(data, cb: Function) {
        let res = await httpMgr.ins.xhrRequest('/Gift/receive', 'GET', data);
        if (res && res.data) {
            cb && cb(res.data);
        }
    }
    // 再领一次
    public async receiveAgain(data, cb: Function) {
        let res = await httpMgr.ins.xhrRequest('/Gift/receiveAgain', 'GET', data);
        if (res && res.data) {
            cb && cb(res.data);
        }
    }

    // 获取任务
    public async getTaskList(cb: Function) {
        let res = await httpMgr.ins.xhrRequest('/task/getList');
        if (res && res.data) {
            cb && cb(res.data);
        }
    }
}