import { IStateEnterData, IState, BlockState } from "./BlockStateBase";
import GameStateMgr from "./GameStateMgr";
import { BlockIdleState } from "./BlockIdleState";

export class BlockErrState extends BlockState {
    checkToState(state: IState): boolean {
        return state instanceof BlockIdleState;
    }
    onStateEnter(data: IStateEnterData): void {
        let enterData = {} as IStateEnterData;
        this.state.toState(GameStateMgr.ins.blockIdle, enterData);
    }
    onStateLeave(): void {

    }
}