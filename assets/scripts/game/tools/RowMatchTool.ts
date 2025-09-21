import { Grid } from "../Grid";
import { Cell } from "../Types";
import { ITool, ToolType } from "./ITool";

/**
 * 把一行全部设置为已匹配
 */
export class RowMatchTool implements ITool {
    getType(): ToolType {
        return ToolType.ROW_MATCH;
    }
    process(cell: Cell, grid: Grid, onComplete: () => void) {
        grid.rangeCells((c: Cell, i: number, j: number) => {
           if (c.gridID.y === cell.gridID.y) {
                c.match = true;
           }
        });
        // 没有动画，执行完成直接回调
        onComplete();
    }
}