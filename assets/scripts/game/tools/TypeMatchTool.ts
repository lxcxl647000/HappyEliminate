import EventDef from "../../constants/EventDef";
import { CellScript } from "../../custom/gamepanel/CellScript";
import { qc } from "../../framework/qc";
import { Grid } from "../Grid";
import { ConstStatus } from "../gridstate/ConstStatus";
import { ToolsStateEnterData } from "../gridstate/ToolsState";
import { Cell } from "../Types";
import { BoomMatchTool } from "./BoomMatchTool";
import { ColMatchTool } from "./ColMatchTool";
import { ITool, ToolType } from "./ITool";
import { RowMatchTool } from "./RowMatchTool";

/**
 * 把同一种类型的全部设置为已匹配
 */
export class TypeMatchTool implements ITool {
    getType(): ToolType {
        return ToolType.TYPE_MATCH;
    }
    process(data: ToolsStateEnterData, onComplete: () => void) {
        let typeMatchs: Cell[] = [];
        data.cell.match = true;
        // 糖果和炸弹交换 随机是个变炸弹再爆炸
        if (data.swapCell && data.swapCell.tool && data.swapCell.tool.getType() === ToolType.BOOM_MATCH) {
            typeMatchs = this._findRandomTools(ToolType.BOOM_MATCH, data.grid);
            onComplete = () => {
                qc.eventManager.emit(EventDef.Trigger_Tools, typeMatchs);
            }
        }
        // 糖果和横竖交换 随机是个变横竖再消除
        else if (data.swapCell && data.swapCell.tool && (data.swapCell.tool.getType() === ToolType.COL_MATCH || data.swapCell.tool.getType() === ToolType.ROW_MATCH)) {
            let toolType = data.swapCell.tool.getType();
            typeMatchs = this._findRandomTools(toolType, data.grid);
            onComplete = () => {
                qc.eventManager.emit(EventDef.Trigger_Tools, typeMatchs);
            }
        }
        else {
            let isClearAll = data.swapCell && data.swapCell.tool
                && data.swapCell.tool.getType() === ToolType.TYPE_MATCH
                && data.tool.getType() === ToolType.TYPE_MATCH;
            data.grid.rangeCells((c: Cell, i: number, j: number) => {
                if (isClearAll || (data.swapCell && c.type === data.swapCell.type && c.tool === null)) {
                    c.match = true;
                    typeMatchs.push(c);
                }
            });
        }

        this._playAni(typeMatchs, data.cell.node.getComponent(CellScript), onComplete);
    }

    private _playAni(typeMatchs: Cell[], cellScript: CellScript, onComplete: Function) {
        if (cellScript) {
            setTimeout(() => {
                cellScript.playTypeMatchAnimation(null, 'candyMatch');
                for (let c of typeMatchs) {
                    let cellScript = c.node.getComponent(CellScript);
                    if (cellScript) {
                        cellScript.playTypeMatchAnimation(null, 'candyMatch2');
                    }
                }
                cellScript.typeLightAni(() => {
                    onComplete && onComplete();
                });
            }, (5 / 30) * 1000);
        }
        else {
            onComplete && onComplete();
        }
    }

    private _findRandomTools(toolType: ToolType, grid: Grid) {
        let typeMatchs: Cell[] = [];
        let checkCell = (randomCell: Cell) => {
            if (randomCell === null) {
                return true;
            }
            for (let cell of typeMatchs) {
                if (cell.gridID.x === randomCell.gridID.x && cell.gridID.y === randomCell.gridID.y) {
                    return true;
                }
            }
            return false;
        }
        for (let i = 0; i < 10; i++) {
            let randomCell: Cell = null;
            while (checkCell(randomCell)) {
                randomCell = grid.randomCell();
            }
            typeMatchs.push(randomCell);
        }

        for (let cell of typeMatchs) {
            let iTool = toolType === ToolType.COL_MATCH ? new ColMatchTool() : new RowMatchTool();
            switch (toolType) {
                case ToolType.BOOM_MATCH:
                    iTool = new BoomMatchTool();
                    break;
                case ToolType.COL_MATCH:
                    iTool = new ColMatchTool();
                    break;
                case ToolType.ROW_MATCH:
                    iTool = new RowMatchTool();
                    break;
            }
            if (!cell.node) {
                ConstStatus.getInstance().fillState.fillWithTool(cell, iTool);
            }
            else {
                let cellScript = cell.node.getComponent(CellScript);
                if (cellScript) {
                    cellScript.setToolType(toolType);
                    ConstStatus.getInstance().fillState.setWithTool(cell, iTool);
                }
            }
        }

        return typeMatchs;
    }
}