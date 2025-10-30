import { GameGrid } from "../GameGrid";
import { IStateEnterData, IState, BlockState } from "./BlockStateBase";
import { BlockFindState, BlockFindEnterData } from "./BlockFindState";
import GameStateMgr from "./GameStateMgr";
import { Block } from "../Block";
import { ITool } from "../GameConstant";


export class BlockToolEnterData extends IStateEnterData {
    block: Block;
    tool: ITool;
    grid: GameGrid;
    swapBlock?: Block;
}

export class BlockToolState extends BlockState {
    checkToState(state: IState): boolean {
        return state instanceof BlockFindState ||
            state instanceof BlockToolState;
    }
    onStateEnter(data: BlockToolEnterData): void {
        data.tool.useTool(data, () => {
            data.grid.rangeBlocks((c: Block, i: number, j: number) => {
                if (c.match && c.tool) {
                    let toolData = { block: c, grid: data.grid, tool: c.tool } as BlockToolEnterData;
                    this.state.toState(GameStateMgr.ins.blockTool, toolData);
                    return;
                }
            });
            let findData = { grid: data.grid } as BlockFindEnterData;
            this.state.toState(GameStateMgr.ins.blockFind, findData);
        });
    }
    onStateLeave(): void {

    }
}