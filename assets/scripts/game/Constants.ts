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

    static GRID_WIDTH: number = 650;
    // 根据每行最多可以放多少，计算cell的大小
    static GRID_CELL_SIZE: number = Constants.GRID_WIDTH / Constants.GRID_SIZE_MAX;

    // CELL 大小缩放比例，目的是预留一些空隙
    static GRID_CELL_SIZE_SCALE: number = 0.8;
    static GRID_CELL_BG_SIZE_SCALE: number = 0.95;

    // 消除动画时长
    static CELL_DISAPPEAR_DURATION: number = 0.3;
    // 下落动画时长
    static CELL_DROP_DURATION: number = 0.2;
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

    // 关卡列表
    public static LEVEL_DATA_PATH: string = "level_details/levels" // do not have .json ex
    public static LEVEL_DATA_KEY: string = "levels_data";

    public static LEVEL_CURRENT_KEY: string = "level_data_current";


    public static PLAYER_DATA_KEY: string = "PLAYER_DATA_KEY";

    // 复活增加步数//
    public static Resurrection_Add_Steps = 5;
}


