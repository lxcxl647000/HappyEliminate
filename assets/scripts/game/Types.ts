import { _decorator, Node, random, randomRangeInt, Vec2 } from 'cc';
import { ITool, ToolType } from './tools/ITool';

export enum CellType {
    INVALID = 0,
    TYPE_1 = 1,
    TYPE_2,
    TYPE_3,
    TYPE_4,
    // TYPE_5,
    TOTALCOUNT
};

/**
 * 地图的Grid 类型
 */
export enum GridItemType {
    INVALID = 0,        // 无效 网格， 也会有背景
    NORMAL = 1,         // 正常 网格，会添加背景
    WALL = 2,           // 墙壁 网格，背景是墙，不允许滑动   
    ARROW_LEFT = 3,     // 箭头 网格，网格上的元素会进行移动
    ARROW_DOWN = 4,
    ARROW_RIGHT= 5,
    ARROW_UP = 6,
};

export class Cell {
    // pos
    x: number;
    y: number;

    // 记录在grid中的位置，便于消除计算， 
    gridID: Vec2;

    // node
    node: Node = null;

    // type 类型不同，显示的图标不同
    type: CellType = CellType.INVALID;
    // 是否是一个道具
    tool: ITool = null;

    // 是否被匹配上，也就是是否需要消除
    match: boolean = false;

    sameType(cell: Cell) {
        return this.type == cell.type;
    }

    isValid() {
        return this.type !== CellType.INVALID;
    }
}