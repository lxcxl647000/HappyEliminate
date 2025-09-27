import { ToolsStateEnterData } from "../gridstate/ToolsState";
import { Cell } from "../Types";
import { ITool, ToolType } from "./ITool";

/**
 * 把同一种类型的全部设置为已匹配
 */
export class TypeMatchTool implements ITool {
    getType(): ToolType {
        return ToolType.TYPE_MATCH;
    }
    process(data: ToolsStateEnterData, onComplete: () => void) {
        let isClearAll = data.swapCell && data.swapCell.tool
            && data.swapCell.tool.getType() === ToolType.TYPE_MATCH
            && data.tool.getType() === ToolType.TYPE_MATCH;
        data.cell.match = true;
        data.grid.rangeCells((c: Cell, i: number, j: number) => {
            if (isClearAll || (data.swapCell && c.type === data.swapCell.type && c.tool === null)) {
                c.match = true;
            }
        });
        // 没有动画，执行完成直接回调
        onComplete();
    }
}