import { Grid } from "../Grid";
import { Cell } from "../Types";
import { ConstStatus } from "./ConstStatus";
import { FindMatchState, FindMatchStateEnterData } from "./FindMatchState";
import { IdelState } from "./IdelState";
import { CellUtils } from "../gameutils/CellUtils";
import { IEnterData, IState, StateWithMachine } from "../util/StateMachine";
import { GridListener } from "../../custom/gamepanel/LevelGridLayout";

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
            state instanceof IdelState;
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
            if (this.listener) {
                this.listener.onSwapStep(data.fromCell, data.toCell);
            }

            data.grid.swapCell(data.fromCell, data.toCell);
            // 执行swap的动画
            CellUtils.changePostion(data.fromCell, data.grid);
            CellUtils.changePostion(data.toCell, data.grid, () => {
                this.stateMachine.transitionTo(
                    ConstStatus.getInstance().findMatchState,
                    {
                        swapCellFrom: data.fromCell,
                        swapCellTo: data.toCell,
                        grid: data.grid
                    } as FindMatchStateEnterData)
            });
        }
    }
    onLeave(): void {
    }
}