import { _decorator } from "cc";
const { ccclass, property } = _decorator;

@ccclass('GlobalData')
export class GlobalData extends Map<string, any> {

    private constructor() {
        super();
    }
   
    private static instance: GlobalData = undefined;
    public static getInstance() {
        if (!this.instance) {
            this.instance = new GlobalData();
        }
        return this.instance;
    }

    /**
     * 添加全局数据，如果标识重复，则会返回失败
     * @param key 数据标识，不能重复
     */
    public addData(key: string, data : any) : boolean {
        if (this.has(key)) {
            return false;
        }
        this.set(key, data);

        return true;
    }

    public setDataStr(key: string, data : any) {
        this.set(key, JSON.stringify(data));
    }

    public getDataStr(key:string) : any {
        return JSON.parse(this.get(key));
    }
}