import EventDef from "../../constants/EventDef";
import { qc } from "../../framework/qc";
import { Grid } from "../Grid";
import { Cell } from "../Types";
import { ITool, ToolType } from "./ITool";

/**
 * 增加步数+3
 */
export class StepsTool implements ITool {
    getType(): ToolType {
        return ToolType.TYPE_STEPS;
    }
    process(cell: Cell, grid: Grid, onComplete: () => void) {
        qc.eventManager.emit(EventDef.UseStepsTool, 3);
        // 没有动画，执行完成直接回调
        onComplete();
    }
}