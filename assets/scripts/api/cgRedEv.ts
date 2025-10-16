import { httpMgr } from "../framework/lib/net/httpMgr";
export default class cgRedEvApi {
    private static _instance: cgRedEvApi = null;
    public static get ins(): cgRedEvApi {
        if (this._instance == null) {
            this._instance = new cgRedEvApi();
        }
        return this._instance;
    }

    // 闯关红包列表
    public async passStatus() {
      
        try {
            let res = await httpMgr.ins.xhrRequest<any>('/game/passStatus', 'GET',)

            return res
        } catch (error) {
         
            // 可以抛出错误或返回默认值
            throw error;
        }

    }
    // 开启闯关红包
     public async redpackPassOpen() {
      
        try {
            let res = await httpMgr.ins.xhrRequest<any>('/game/redpackPassOpen', 'GET',)

            return res
        } catch (error) {
         
            // 可以抛出错误或返回默认值
            throw error;
        }

    }
    
}