import { Grid } from "../Grid";
import { Cell } from "../Types";
import { ITool, ToolType } from "./ITool";

/**
 * 把同一种类型的全部设置为已匹配
 */
export class TypeMatchTool implements ITool {
    getType(): ToolType {
        return ToolType.TYPE_MATCH;
    }
    process(cell: Cell, grid: Grid, onComplete: () => void) {
        let isClearAll = false;
        if (cell['typeMatchCell']) {
            isClearAll = cell.tool && cell.tool.getType() === ToolType.TYPE_MATCH;
            cell['typeMatchCell'].match = true;
            cell['typeMatchCell'] = null;
        }
        grid.rangeCells((c: Cell, i: number, j: number) => {
            if ((c.type === cell.type && c.tool === null) || isClearAll) {
                c.match = true;
            }
        });
        // 没有动画，执行完成直接回调
        onComplete();
    }
}