import { Vec2 } from "cc";
import { Cell } from "../Types";
import { ITool, ToolType } from "./ITool";
import { ToolsStateEnterData } from "../gridstate/ToolsState";
import { CellScript } from "../../custom/gamepanel/CellScript";
import { Constants } from "../Constants";
import { musicMgr } from "../../manager/musicMgr";
import GuideMgr, { GuideType } from "../../manager/GuideMgr";
import { qc } from "../../framework/qc";
import EventDef from "../../constants/EventDef";

/**
 * 周围的消除
 */
export class BoomMatchTool implements ITool {
    getType(): ToolType {
        return ToolType.BOOM_MATCH;
    }
    process(data: ToolsStateEnterData, onComplete: () => void) {
        if (GuideMgr.ins.checkGuide(GuideType.Force_Level_3_Use_Boom)) {
            qc.eventManager.emit(EventDef.HideGuide, GuideType.Force_Level_3_Use_Boom);
        }
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
                musicMgr.ins.playSound('bomb');
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