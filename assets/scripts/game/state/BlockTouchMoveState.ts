import { GameGrid } from "../GameGrid";
import { IStateEnterData, IState, BlockState } from "./BlockStateBase";
import GameStateMgr from "./GameStateMgr";
import { BlockSwapState, BlockSwapEnterData } from "./BlockSwapState";
import { Block } from "../Block";


export class BlockTouchMoveEnterData extends IStateEnterData {
    block1: Block;
    block2: Block;
    grid: GameGrid;
}

export class BlockTouchMoveState extends BlockState {
    checkToState(state: IState): boolean {
        return state instanceof BlockSwapState;
    }
    onStateEnter(data: BlockTouchMoveEnterData): void {
        let swapData = {
            fromBlock: data.block1,
            toBlock: data.block2,
            grid: data.grid
        } as BlockSwapEnterData;
        this.state.toState(GameStateMgr.ins.blockSwap, swapData);
    }

    onStateLeave(): void {

    }
}