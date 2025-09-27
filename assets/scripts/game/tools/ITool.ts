import { ToolsStateEnterData } from "../gridstate/ToolsState";

export interface ITool {
    /**
     * 执行道具
     * @param cell 道具所有的位置 
     * @param grid 所有元素
     * @param onComplete 完成回到
     */
    process(data: ToolsStateEnterData, onComplete: () => void): void;

    /**
     * 获取当前道具的类型
     */
    getType(): ToolType;
}

// 道具类型
export enum ToolType {
    INVALID = 0,
    ROW_MATCH = 1,
    COL_MATCH = 2,
    BOOM_MATCH = 3,
    BOOM_UP_MATCH = 4,
    TYPE_MATCH = 5,
    TYPE_HAMMER = 6,
    TYPE_STEPS = 7,
    TYPE_BOOM = 8,

    RANDOM_GRID = 10,

}