import { httpMgr } from "../framework/lib/net/httpMgr";
export default class AchievementApi {
    private static _instance: AchievementApi = null;
    public static get ins(): AchievementApi {
        if (this._instance == null) {
            this._instance = new AchievementApi();
        }
        return this._instance;
    }

    // 成就列表
    public async getAchievementList() {

        try {
            let res = await httpMgr.ins.xhrRequest<any>('/game/getAchievementList', 'GET',)

            return res
        } catch (error) {

            // 可以抛出错误或返回默认值
            throw error;
        }

    }
    // 领取成就
    public async claimAchievement(data) {

        try {
            let res = await httpMgr.ins.xhrRequest<any>('/game/claimAchievement', 'GET', data)

            return res
        } catch (error) {

            // 可以抛出错误或返回默认值
            throw error;
        }

    }

}