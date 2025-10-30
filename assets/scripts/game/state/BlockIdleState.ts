import { IStateEnterData, IState } from "./BlockStateBase";
import { BlockFindState } from "./BlockFindState";
import { BlockToolState } from "./BlockToolState";
import { BlockTouchMoveState } from "./BlockTouchMoveState";
import { BlockGridListener } from "../../custom/gamepanel/GameBlockGrid";

export class BlockIdleState implements IState {
    private listener: BlockGridListener;
    public setListener(listener: BlockGridListener) {
        this.listener = listener;
    }
    checkToState(state: IState): boolean {
        return state instanceof BlockTouchMoveState ||
            state instanceof BlockToolState ||
            state instanceof BlockFindState;
    }
    onStateEnter(data: IStateEnterData): void {
        if (this.listener) {
            this.listener.onBlockGridStable();
        }
    }
    onStateLeave(): void {

    }
}