import EventDef from "../../constants/EventDef";
import { qc } from "../../framework/qc";
import { GameConstant, ITool, ToolType } from "../GameConstant";
import { BlockToolEnterData } from "../state/BlockToolState";

/**
 * 增加步数+3
 */
export class StepsTool implements ITool {
    getToolType(): ToolType {
        return ToolType.Steps;
    }
    useTool(data: BlockToolEnterData, onComplete: Function) {
        qc.eventManager.emit(EventDef.UseStepsTool, GameConstant.Tool_Add_Steps);
        onComplete();
    }
}