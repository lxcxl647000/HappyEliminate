import { Grid } from "../Grid";
import { Cell } from "../Types";
import { IEnterData, IState, StateWithMachine } from "../util/StateMachine";
import { ConstStatus } from "./ConstStatus";
import { RemoveState, RemoveStateEnterData } from "./RemoveState";

export class FoundMatchStateEnterData extends IEnterData {
    matches: Cell[][]; // 匹配找到的
    toolMatches: Cell[]; // 道具强制移除的
    grid: Grid;

    // 如果是手势操作带来的操作，可以补充这俩值，用来判断生成道具的位置
    swapCellFrom?: Cell;
    swapCellTo?: Cell;

}

export class FoundMatchState extends StateWithMachine {
    getName(): string {
        return 'FoudMatchState';
    }
    canTransitionTo(state: IState): boolean {
        return state instanceof RemoveState;
    }
    onEnter(data: FoundMatchStateEnterData): void {
        // 
        // 直接跳转到remove
        this.stateMachine.transitionTo(
            ConstStatus.getInstance().removeState,
            {
                matches: data.matches,
                toolMatches: data.toolMatches,
                grid: data.grid,
                swapCellFrom: data.swapCellFrom,
                swapCellTo: data.swapCellTo
            } as RemoveStateEnterData
        );
    }
    onLeave(): void {

    }
}