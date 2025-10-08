import { Grid } from "../Grid";
import { Cell } from "../Types";
import { ConstStatus } from "./ConstStatus";
import { FindMatchState, FindMatchStateEnterData } from "./FindMatchState";
import { IdelState } from "./IdelState";
import { CellUtils } from "../gameutils/CellUtils";
import { IEnterData, IState, StateWithMachine } from "../util/StateMachine";
import { GridListener } from "../../custom/gamepanel/LevelGridLayout";
import { ToolsState, ToolsStateEnterData } from "./ToolsState";

export class SwapStateEnterData extends IEnterData {
    fromCell: Cell;
    toCell: Cell;
    grid: Grid;
}

export class SwapState extends StateWithMachine {
    private listener: GridListener;
    public setListener(listener: GridListener) {
        this.listener = listener;
    }
    getName(): string {
        return 'SwapState';
    }
    canTransitionTo(state: IState): boolean {
        return state instanceof FindMatchState ||
            state instanceof IdelState || state instanceof ToolsState;
    }
    onEnter(data: SwapStateEnterData): void {
        if (data.from instanceof FindMatchState) {
            data.grid.swapCell(data.fromCell, data.toCell);
            // 执行swap的动画
            CellUtils.changePostion(data.fromCell, data.grid);
            CellUtils.changePostion(data.toCell, data.grid, () => {
                // 从匹配过来的，swap ，直接进入idel
                this.stateMachine.transitionTo(ConstStatus.getInstance().idelState, {} as IEnterData)
            });
        } else {
            let findMatchData = {
                swapCellFrom: data.fromCell,
                swapCellTo: data.toCell,
                grid: data.grid
            } as FindMatchStateEnterData;

            data.grid.swapCell(data.fromCell, data.toCell);
            // 执行swap的动画
            CellUtils.changePostion(data.fromCell, data.grid);
            CellUtils.changePostion(data.toCell, data.grid, () => {
                let matches = ConstStatus.getInstance().findMatchState.findMatch(data);
                if ((matches.length > 0 || data.fromCell.tool || data.toCell.tool) && this.listener) {
                    this.listener.onSwapStep(data.fromCell, data.toCell);
                }
                // 交换中是否有道具//
                let isTool = this._handleSwapTools(data);
                !isTool && this.stateMachine.transitionTo(ConstStatus.getInstance().findMatchState, findMatchData);
            });
        }
    }
    onLeave(): void {
    }

    // 处理发生交换时有道具//
    private _handleSwapTools(data: SwapStateEnterData) {
        let toolCell: Cell = null;
        if (data.fromCell.tool) {
            toolCell = data.fromCell;
        } else if (data.toCell.tool) {
            toolCell = data.toCell;
        }
        if (toolCell) {
            let cell = toolCell === data.fromCell ? data.toCell : data.fromCell;
            this.stateMachine.transitionTo(
                ConstStatus.getInstance().toolsState,
                {
                    cell: toolCell,
                    tool: toolCell.tool,
                    grid: data.grid,
                    swapCell: cell
                } as ToolsStateEnterData
            );
            return true;
        }
        return false;
    }
}