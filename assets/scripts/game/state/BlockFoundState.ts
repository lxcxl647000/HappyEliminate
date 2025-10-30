import { GameGrid } from "../GameGrid";
import { IStateEnterData, IState, BlockState } from "./BlockStateBase";
import GameStateMgr from "./GameStateMgr";
import { BlockRemoveState, BlockRemoveEnterData } from "./BlockRemoveState";
import { Block } from "../Block";

export class BlockFoundEnterData extends IStateEnterData {
    matches: Block[][];
    toolMatches: Block[];
    grid: GameGrid;
    swapBlockFrom?: Block;
    swapBlockTo?: Block;
}

export class BlockFoundState extends BlockState {
    checkToState(state: IState): boolean {
        return state instanceof BlockRemoveState;
    }
    onStateEnter(data: BlockFoundEnterData): void {
        let rvData = {
            matches: data.matches,
            toolMatches: data.toolMatches,
            grid: data.grid,
            swapBlockFrom: data.swapBlockFrom,
            swapBlockTo: data.swapBlockTo
        } as BlockRemoveEnterData;
        this.state.toState(GameStateMgr.ins.blockRemove, rvData);
    }
    onStateLeave(): void {

    }
}