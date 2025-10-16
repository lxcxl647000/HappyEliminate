import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('shezhiMgr')
export class shezhiMgr extends Component {

    /**
   * 获取背景音乐是否启用的状态
   * @returns 返回布尔值，表示背景音乐是否启用
   */
    private static yinyueEnabled: boolean = true
    public static get YinyueEnabled(): boolean {
        return this.yinyueEnabled
    }
    public static set YinyueEnabled(v: boolean) {
        this.yinyueEnabled = v;
    }
    /**
    * 获取音效是否启用的状态
    * @returns 返回布尔值，表示音效是否启用
    */
    private static yinxiaoEnabled: boolean = true
    public static get YinxiaoEnabled(): boolean {
        return this.yinxiaoEnabled
    }
    public static set YinxiaoEnabled(v: boolean) {
        this.yinxiaoEnabled = v;
    }
    /**
   * 获取震动功能是否启用的状态
   * @returns 返回布尔值，表示震动功能是否启用
   */
    private static zhendongEnabled: boolean = true
    public static get ZhendongEnabled(): boolean {
        return this.zhendongEnabled
    }
    public static set ZhendongEnabled(v: boolean) {
        this.zhendongEnabled = v
    }
    /**
     * 音乐音量
     */
    private static yinyueValue: number = 0.8
    public static get YinyueValue(): number {
        return this.yinyueValue
    }
    public static set YinyueValue(v: number) {
        this.yinyueValue = v
    }
    /**
   * 音效音量
   */
    private static yinxiaoValue: number = 1
    public static get YinxiaoValue(): number {
        return this.yinxiaoValue
    }
    public static set YinxiaoValue(v: number) {
        this.yinxiaoValue = v
    }


    public static vibrateEnabled: boolean = true;


    /**
     * 初始化设置
     */
    public static init() {
        if (this.yinyueEnabled) {
            this.yinyueValue = 0.8
        } else {
            this.yinyueValue = 0
        }
        if (this.yinxiaoEnabled) {
            this.yinxiaoValue = 1
        } else {
            this.yinxiaoValue = 0
        }
    }
}


