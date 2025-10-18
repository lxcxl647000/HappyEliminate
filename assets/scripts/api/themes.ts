import { httpMgr } from "../framework/lib/net/httpMgr";
export default class themesApi {
    private static _instance: themesApi = null;
    public static get ins(): themesApi {
        if (this._instance == null) {
            this._instance = new themesApi();
        }
        return this._instance;
    }

    // 主题列表
    public async getThemesList() {

        try {
            let res = await httpMgr.ins.xhrRequest<any>('/game/themes', 'GET',)

            return res
        } catch (error) {

            // 可以抛出错误或返回默认值
            throw error;
        }

    }
    // 兑换主题
    public async themeExchange(data) {

        try {
            let res = await httpMgr.ins.xhrRequest<any>('/game/themeExchange', 'GET', data)

            return res
        } catch (error) {

            // 可以抛出错误或返回默认值
            throw error;
        }

    }
    // 使用主题
    public async themeUse(data) {

        try {
            let res = await httpMgr.ins.xhrRequest<any>('/game/themeUse', 'GET', data)

            return res
        } catch (error) {

            // 可以抛出错误或返回默认值
            throw error;
        }

    }

}