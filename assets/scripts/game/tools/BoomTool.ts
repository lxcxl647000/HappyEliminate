import { Vec2 } from "cc";
import { Grid } from "../Grid";
import { Cell } from "../Types";
import { ITool, ToolType } from "./ITool";

/**
 * 使用后在屏幕上3X3区域爆炸
 */
export class BoomTool implements ITool {
    getType(): ToolType {
        return ToolType.TYPE_BOOM;
    }
    process(cell: Cell, grid: Grid, onComplete: () => void) {
        if (!cell) {
            cell = grid.randomCell();
        }
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