import { Vec2 } from "cc";
import { Cell } from "../Types";
import { ITool, ToolType } from "./ITool";
import { ToolsStateEnterData } from "../gridstate/ToolsState";

/**
 * 使用后在屏幕上3X3区域爆炸
 */
export class BoomTool implements ITool {
    getType(): ToolType {
        return ToolType.TYPE_BOOM;
    }
    process(data: ToolsStateEnterData, onComplete: () => void) {
        if (!data.cell) {
            data.cell = data.grid.randomCell();
        }
        data.grid.rangeCells((c: Cell, i: number, j: number) => {
            const dis = Vec2.distance(data.cell.gridID, c.gridID);
            if (dis < 2) {
                c.match = true;
            }
        });
        // 没有动画，执行完成直接回调
        onComplete();
    }
}