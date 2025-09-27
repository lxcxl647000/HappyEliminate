import { Vec2 } from "cc";
import { Cell } from "../Types";
import { ITool, ToolType } from "./ITool";
import { ToolsStateEnterData } from "../gridstate/ToolsState";

/**
 * 周围的消除 半径更大
 */
export class BoomUpMatchTool implements ITool {
    getType(): ToolType {
        return ToolType.BOOM_UP_MATCH;
    }
    process(data: ToolsStateEnterData, onComplete: () => void) {
        data.grid.rangeCells((c: Cell, i: number, j: number) => {
            const dis = Vec2.distance(data.cell.gridID, c.gridID);
            if (dis < 4) {
                c.match = true;
            }
        });
        // 没有动画，执行完成直接回调
        onComplete();
    }
}