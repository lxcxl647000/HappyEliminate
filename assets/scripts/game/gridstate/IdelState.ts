import { GridListener } from "../../custom/gamepanel/LevelGridLayout";
import { IEnterData, IState } from "../util/StateMachine";
import { ErrorState } from "./ErrorState";
import { FillState } from "./FillState";
import { FindMatchState } from "./FindMatchState";
import { SwapState } from "./SwapState";
import { ToolsState } from "./ToolsState";
import { TouchMoveState } from "./TouchMoveState";

export class IdelState implements IState {
    private listener: GridListener;
    public setListener(listener: GridListener) {
        this.listener = listener;
    }
    getName(): string {
        return 'IdelState';
    }
    canTransitionTo(state: IState): boolean {
        return state instanceof TouchMoveState ||
            state instanceof ToolsState ||
            state instanceof FindMatchState;
    }
    onEnter(data: IEnterData): void {
        if (this.listener) {
            this.listener.onStable();
        }
    }
    onLeave(): void {

    }
}