import EventDef from "../../constants/EventDef";
import { CellScript } from "../../custom/gamepanel/CellScript";
import { qc } from "../../framework/qc";
import GuideMgr, { GuideType } from "../../manager/GuideMgr";
import { Constants } from "../Constants";
import { ToolsStateEnterData } from "../gridstate/ToolsState";
import { Cell } from "../Types";
import { ITool, ToolType } from "./ITool";

/**
 * 把一列全部设置为已匹配
 */
export class ColMatchTool implements ITool {
    getType(): ToolType {
        return ToolType.COL_MATCH;
    }
    process(data: ToolsStateEnterData, onComplete: () => void) {
        if (GuideMgr.ins.checkGuide(GuideType.Force_Level_2_Use_ColMatch)) {
            qc.eventManager.emit(EventDef.HideGuide, GuideType.Force_Level_2_Use_ColMatch);
        }
        let colSideCells: Cell[] = [];
        let rowSideCells: Cell[] = [];
        if (data.swapCell && data.swapCell.tool && data.swapCell.tool.getType() === ToolType.COL_MATCH) {
            data.grid.rangeCells((c: Cell, i: number, j: number) => {
                if (c.gridID.x === data.cell.gridID.x
                    || c.gridID.x === data.cell.gridID.x - 1
                    || c.gridID.x === data.cell.gridID.x + 1) {
                    if (c.gridID.y === data.cell.gridID.y) {
                        colSideCells.push(c);
                    }
                    c.match = true;
                }
            });
        }
        else if (data.swapCell && data.swapCell.tool && data.swapCell.tool.getType() === ToolType.ROW_MATCH) {
            data.grid.rangeCells((c: Cell, i: number, j: number) => {
                if (c.gridID.x === data.cell.gridID.x
                    || c.gridID.x === data.cell.gridID.x - 1
                    || c.gridID.x === data.cell.gridID.x + 1) {
                    if (c.gridID.y === data.cell.gridID.y) {
                        colSideCells.push(c);
                    }
                    c.match = true;
                }
                if (c.gridID.y === data.swapCell.gridID.y
                    || c.gridID.y === data.swapCell.gridID.y - 1
                    || c.gridID.y === data.swapCell.gridID.y + 1) {
                    if (c.gridID.x === data.cell.gridID.x) {
                        rowSideCells.push(c);
                    }
                    c.match = true;
                }
            });
        }
        else {
            data.grid.rangeCells((c: Cell, i: number, j: number) => {
                if (c.gridID.x === data.cell.gridID.x) {
                    c.match = true;
                }
            });
        }

        let cellScript = data.cell.node.getComponent(CellScript);
        if (cellScript) {
            cellScript.activeBgLight();
            cellScript.playColMatchAnimation(() => {
                cellScript.hideBgLight();
            });
            setTimeout(() => {
                cellScript.colLineLightAni(() => {
                    onComplete();
                });
            }, Constants.LineLightDelayTime);

            if (colSideCells.length > 0) {
                for (let cell of colSideCells) {
                    let cellScript = cell.node.getComponent(CellScript);
                    if (cellScript) {
                        cellScript.activeBgLight();
                        cellScript.playColMatchAnimation(() => {
                            cellScript.hideBgLight();
                        });
                        setTimeout(() => {
                            cellScript.colLineLightAni(null);
                        }, Constants.LineLightDelayTime);
                    }
                }
            }
            if (rowSideCells.length > 0) {
                for (let cell of rowSideCells) {
                    let cellScript = cell.node.getComponent(CellScript);
                    if (cellScript) {
                        cellScript.activeBgLight();
                        cellScript.playRowMatchAnimation(() => {
                            cellScript.hideBgLight();
                        });
                        setTimeout(() => {
                            cellScript.rowLineLightAni(null);
                        }, Constants.LineLightDelayTime);
                    }
                }
            }
        }
        else {
            onComplete();
        }
    }
}