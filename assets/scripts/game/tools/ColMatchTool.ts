import { ToolsStateEnterData } from "../gridstate/ToolsState";
import { Cell } from "../Types";
import { ITool, ToolType } from "./ITool";

/**
 * 把一列全部设置为已匹配
 */
export class ColMatchTool implements ITool {
    getType(): ToolType {
        return ToolType.COL_MATCH;
    }
    process(data: ToolsStateEnterData, onComplete: () => void) {
        if (data.swapCell && data.swapCell.tool && data.swapCell.tool.getType() === ToolType.COL_MATCH) {
            data.grid.rangeCells((c: Cell, i: number, j: number) => {
                if (c.gridID.x === data.cell.gridID.x
                    || c.gridID.x === data.cell.gridID.x - 1
                    || c.gridID.x === data.cell.gridID.x + 1) {
                    c.match = true;
                }
            });
        }
        else if (data.swapCell && data.swapCell.tool && data.swapCell.tool.getType() === ToolType.ROW_MATCH) {
            data.grid.rangeCells((c: Cell, i: number, j: number) => {
                if (c.gridID.x === data.cell.gridID.x
                    || c.gridID.x === data.cell.gridID.x - 1
                    || c.gridID.x === data.cell.gridID.x + 1) {
                    c.match = true;
                }
                if (c.gridID.y === data.swapCell.gridID.y
                    || c.gridID.y === data.swapCell.gridID.y - 1
                    || c.gridID.y === data.swapCell.gridID.y + 1) {
                    c.match = true;
                }
            });
        }
        else {
            data.grid.rangeCells((c: Cell, i: number, j: number) => {
                if (c.gridID.x === data.cell.gridID.x) {
                    c.match = true;
                }
            });
        }

        // 没有动画，执行完成直接回调
        onComplete();
    }
}