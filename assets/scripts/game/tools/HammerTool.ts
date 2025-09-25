import { Grid } from "../Grid";
import { Cell } from "../Types";
import { ITool, ToolType } from "./ITool";

/**
 * 任意消除一个
 */
export class HammerTool implements ITool {
    static isUsing = false;
    getType(): ToolType {
        return ToolType.TYPE_HAMMER;
    }
    process(cell: Cell, grid: Grid, onComplete: () => void) {
        if (cell) {
            cell.match = true;
        }
        // 没有动画，执行完成直接回调
        onComplete();
    }
}