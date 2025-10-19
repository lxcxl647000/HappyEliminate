/**
 * 存放全局的常量
 */
export class Constants {

    // 屏幕大小
    static SCREEN_WIDTH: number = 720;
    static SCREEN_HEIGHT: number = 1280;

    // 消除区域大小
    static GRID_SIZE_WIDTH: number = 9; // 地图大小，每行每列多少个
    static GRID_SIZE_HEIGHT: number = 9; // 地图大小，每行每列多少个
    static GRID_SIZE_MAX: number = 9; // 地图大小，每行最多多少个

    // static GRID_WIDTH: number = 650;
    static GRID_WIDTH: number = 643;
    // 根据每行最多可以放多少，计算cell的大小
    static GRID_CELL_SIZE: number = Constants.GRID_WIDTH / Constants.GRID_SIZE_MAX;

    // CELL 大小缩放比例，目的是预留一些空隙
    static GRID_CELL_SIZE_SCALE: number = 0.9;
    static GRID_CELL_BG_SIZE_SCALE: number = 0.95;

    // 消除动画时长
    static CELL_DISAPPEAR_DURATION: number = 0.165;
    // 消除动画中光效延时出现时间
    static CELL_DISAPPEAR_LIGHT_DELAY: number = .433;
    // 下落动画时长
    static CELL_DROP_DURATION: number = 0.166;
    // 移动到目标位置的时长
    static CELL_MOVE_TO_GOAL_DURATION: number = 0.5;
    // 进度条变化动画
    static PROGRESS_CHANGE_DURATION: number = 0.2;

    // 弹窗动画时长
    static DIALOG_SHOW_OR_HIDE_DURATION: number = 0.2;

    // 关卡菜单的配置
    static MENU_LIST_WIDTH: number = 600;
    static MENU_LIST_HEIGHT: number = 800;
    static MENU_LIST_ROW_COUNTER: number = 4;
    static MENU_LIST_ITEM_SIZE: number = Constants.MENU_LIST_WIDTH / Constants.MENU_LIST_ROW_COUNTER;


    // 用于存本地的key值//
    // public static PLAYER_DATA_KEY: string = "PLAYER_DATA_KEY";
    public static LUCKY_TURNTABLE_DATA_KEY: string = "LUCKY_TURNTABLE_DATA_KEY";


    // 复活增加步数//
    public static Resurrection_Add_Steps = 5;
    // 增加步数道具增加步数//
    public static Tool_Add_Steps = 3;
    // 每局消耗体力//
    public static Energy_Cost = 10;
    // 幸运转盘每天总使用次数//
    public static LuckyTurntable_TotalNum = 10;

    public static LineLightDelayTime: number = (18 / 30) * 1000;
    public static BoomLightDelayTime: number = (20 / 30) * 1000;
    // 失败恢复步数消耗的金币数
    public static Steps_Cost_Gold = 200;
}


