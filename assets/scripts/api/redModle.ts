import { httpMgr } from "../framework/lib/net/httpMgr";
interface redPack {
    /*
    1新人红包 2关卡和闯关红包
    */
    type?: number,
    /*
    关卡红包 1/5/15
  */
    level_no?: number
    
}
export default class redModelApi {
    private static _instance: redModelApi = null;
    public static get ins(): redModelApi {
        if (this._instance == null) {
            this._instance = new redModelApi();
        }
        return this._instance;
    }

    // 开启红包接口
    public async redpackOpen(data: redPack,) {
    
        try {
            let res = await httpMgr.ins.xhrRequest<any>('/game/redpackOpen', 'GET', data)

            return res
        } catch (error) {
        
            // 可以抛出错误或返回默认值
            throw error;
        }


    }
}