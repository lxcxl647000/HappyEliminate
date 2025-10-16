/**
 * 引擎适配文件
 */
export default interface adapter_interface {
    /**是否在taobao运行环境 */
    onTaobao(): boolean;

    /**是否在wx运行环境 */
    onWx(): boolean;

    /**是否在bilibili运行环境 */
    onBilibili(): boolean;
}