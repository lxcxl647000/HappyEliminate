import { Grid } from "../Grid";
import { Cell } from "../Types";
import { IEnterData, IState, StateWithMachine } from "../util/StateMachine";
import { ConstStatus } from "./ConstStatus";

import { SwapState, SwapStateEnterData } from "./SwapState";


export class TouchMoveStateEnterData extends IEnterData {
    cell1: Cell;
    cell2: Cell;
    grid: Grid;
}

export class TouchMoveState extends StateWithMachine {
    getName(): string {
        return 'TouchMoveState';
    }
    canTransitionTo(state: IState): boolean {
        return state instanceof SwapState;
    }
    onEnter(data: TouchMoveStateEnterData): void {
        // 直接触发
        this.stateMachine.transitionTo(
            ConstStatus.getInstance().swapState,
            {
                fromCell: data.cell1,
                toCell: data.cell2,
                grid: data.grid
            } as SwapStateEnterData
        );
    }

    onLeave(): void {

    }
}