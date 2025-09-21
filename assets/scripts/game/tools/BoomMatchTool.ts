import { Vec2 } from "cc";
import { Grid } from "../Grid";
import { Cell } from "../Types";
import { ITool, ToolType } from "./ITool";

/**
 * 周围的消除
 */
export class BoomMatchTool implements ITool {
    getType(): ToolType {
        return ToolType.BOOM_MATCH;
    }
    process(cell: Cell, grid: Grid, onComplete: () => void) {
        grid.rangeCells((c: Cell, i: number, j: number) => {
            const dis = Vec2.distance(cell.gridID, c.gridID);
            if (dis < 2) {
                c.match = true;
            }
        });
        // 没有动画，执行完成直接回调
        onComplete();
    }
}