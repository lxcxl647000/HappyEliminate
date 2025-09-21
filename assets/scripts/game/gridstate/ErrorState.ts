import { IEnterData, IState, StateWithMachine } from "../util/StateMachine";
import { ConstStatus } from "./ConstStatus";
import { IdelState } from "./IdelState";

export class ErrorState extends StateWithMachine {

    getName(): string {
        return 'ErrorState';
    }
    canTransitionTo(state: IState): boolean {
        return state instanceof IdelState;
    }
    onEnter(data: IEnterData): void {
        // log some for debugging
        this.stateMachine.transitionTo(
            ConstStatus.getInstance().idelState,
            {
            } as IEnterData
        );
    }
    onLeave(): void {

    }
}