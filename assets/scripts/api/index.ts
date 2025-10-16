import { httpMgr } from "../framework/lib/net/httpMgr";

export default class HomeApi {
    private static _instance: HomeApi = null;
    public static get ins(): HomeApi {
        if (this._instance == null) {
            this._instance = new HomeApi();
        }
        return this._instance;
    }
    // 首页接口
    public async getHomeData(data: {},) {
        try {
            let res = await httpMgr.ins.xhrRequest<any>('/game/home', 'GET', data)

            return res
        } catch (error) {
            console.error('获取首页数据失败:', error);
            // 可以抛出错误或返回默认值
            throw error;
        }
    }
}