import { ToolsStateEnterData } from "../gridstate/ToolsState";
import { ITool, ToolType } from "./ITool";

/**
 * 任意消除一个
 */
export class HammerTool implements ITool {
    getType(): ToolType {
        return ToolType.TYPE_HAMMER;
    }
    process(data: ToolsStateEnterData, onComplete: () => void) {
        if (data.cell) {
            data.cell.match = true;
        }
        // 没有动画，执行完成直接回调
        onComplete();
    }
}