import { GameGrid } from "../GameGrid";
import { BlockFindState, BlockFindEnterData } from "./BlockFindState";
import { BlockIdleState } from "./BlockIdleState";
import { IStateEnterData, IState, BlockState } from "./BlockStateBase";
import { BlockToolState, BlockToolEnterData } from "./BlockToolState";
import { GameUtils } from "../GameUtils";
import GameStateMgr from "./GameStateMgr";
import { Block } from "../Block";
import { BlockGridListener } from "../../custom/gamepanel/GameBlockGrid";

export class BlockSwapEnterData extends IStateEnterData {
    fromBlock: Block;
    toBlock: Block;
    grid: GameGrid;
}

export class BlockSwapState extends BlockState {
    private listener: BlockGridListener;
    public setListener(listener: BlockGridListener) {
        this.listener = listener;
    }
    checkToState(state: IState): boolean {
        return state instanceof BlockFindState ||
            state instanceof BlockIdleState || state instanceof BlockToolState;
    }
    onStateEnter(data: BlockSwapEnterData): void {
        if (data.from instanceof BlockFindState) {
            data.grid.swapBlock(data.fromBlock, data.toBlock);
            GameUtils.updateBlockPos(data.fromBlock, data.grid);
            GameUtils.updateBlockPos(data.toBlock, data.grid, () => {
                this.state.toState(GameStateMgr.ins.blockIdle, {} as IStateEnterData)
            });
        } else {
            let findMatchData = {
                swapBlockFrom: data.fromBlock,
                swapBlockTo: data.toBlock,
                grid: data.grid
            } as BlockFindEnterData;
            data.grid.swapBlock(data.fromBlock, data.toBlock);
            GameUtils.updateBlockPos(data.fromBlock, data.grid);
            GameUtils.updateBlockPos(data.toBlock, data.grid, () => {
                let matches = GameStateMgr.ins.blockFind.findMatch(data);
                if ((matches.length > 0 || data.fromBlock.tool || data.toBlock.tool) && this.listener) {
                    this.listener.onBlockSwapStep(data.fromBlock, data.toBlock);
                }
                let isTool = this._handleSwapTools(data);
                !isTool && this.state.toState(GameStateMgr.ins.blockFind, findMatchData);
            });
        }
    }
    onStateLeave(): void {
    }

    // 处理发生交换时有道具//
    private _handleSwapTools(data: BlockSwapEnterData) {
        let toolBlock: Block = null;
        if (data.fromBlock.tool) {
            toolBlock = data.fromBlock;
        } else if (data.toBlock.tool) {
            toolBlock = data.toBlock;
        }
        if (toolBlock) {
            let block = toolBlock === data.fromBlock ? data.toBlock : data.fromBlock;
            let toolData = { block: toolBlock, grid: data.grid, tool: toolBlock.tool, swapBlock: block } as BlockToolEnterData;
            this.state.toState(GameStateMgr.ins.blockTool, toolData);
            return true;
        }
        return false;
    }
}