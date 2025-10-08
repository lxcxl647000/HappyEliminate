import { Vec2 } from "cc";
import { Cell } from "../Types";
import { ITool, ToolType } from "./ITool";
import { ToolsStateEnterData } from "../gridstate/ToolsState";
import { CellScript } from "../../custom/gamepanel/CellScript";
import { Constants } from "../Constants";

/**
 * 周围的消除
 */
export class BoomMatchTool implements ITool {
    getType(): ToolType {
        return ToolType.BOOM_MATCH;
    }
    process(data: ToolsStateEnterData, onComplete: () => void) {
        if (data.swapCell && data.swapCell.tool && data.swapCell.tool.getType() === ToolType.BOOM_MATCH) {
            data.grid.rangeCells((c: Cell, i: number, j: number) => {
                const dis = Vec2.distance(data.cell.gridID, c.gridID);
                if (dis < 4) {
                    c.match = true;
                }
            });
        }
        else {
            data.grid.rangeCells((c: Cell, i: number, j: number) => {
                const dis = Vec2.distance(data.cell.gridID, c.gridID);
                if (dis < 2) {
                    c.match = true;
                }
            });
        }

        let cellScript = data.cell.node.getComponent(CellScript);
        if (cellScript) {
            cellScript.activeBgLight();
            cellScript.playBoomMatchAnimation(() => {
                cellScript.hideBgLight();
            });
            setTimeout(() => {
                cellScript.boomLightAni(() => {
                    onComplete();
                });
            }, Constants.BoomLightDelayTime);
        }
        else {
            onComplete();
        }
    }
}