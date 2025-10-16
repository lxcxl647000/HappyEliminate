import { Vec2 } from "cc";
import { Cell } from "../Types";
import { ITool, ToolType } from "./ITool";
import { ToolsStateEnterData } from "../gridstate/ToolsState";
import { CellScript } from "../../custom/gamepanel/CellScript";
import { Constants } from "../Constants";
import { musicMgr } from "../../manager/musicMgr";
import { qc } from "../../framework/qc";
import EventDef from "../../constants/EventDef";
import GuideMgr, { GuideType } from "../../manager/GuideMgr";

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
                    if (GuideMgr.ins.checkGuide(GuideType.Force_Level_1_Pass_Target)) {
                        qc.eventManager.emit(EventDef.PassTargetGuide);
                    }
                });
            }, Constants.BoomLightDelayTime);
        }
        else {
            onComplete();
        }
    }
}