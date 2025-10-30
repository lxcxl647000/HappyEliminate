import { BlockIdleState } from "./BlockIdleState";
import { BlockFoundState, BlockFoundEnterData } from "./BlockFoundState";
import { BlockSwapState, BlockSwapEnterData } from "./BlockSwapState";
import { GameGrid } from "../GameGrid";
import { RandomTool } from "../tools/RandomTool";
import { IStateEnterData, IState, BlockState } from "./BlockStateBase";
import { BlockToolEnterData } from "./BlockToolState";
import GameStateMgr from "./GameStateMgr";
import { BlockType } from "../GameConstant";
import { Block } from "../Block";
import { BlockGridListener } from "../../custom/gamepanel/GameBlockGrid";

export class BlockFindEnterData extends IStateEnterData {
    swapBlockFrom?: Block;
    swapBlockTo?: Block;
    grid: GameGrid;
}


export class BlockFindState extends BlockState {
    private listener: BlockGridListener;

    public setListener(listener: BlockGridListener) {
        this.listener = listener;
    }

    checkToState(state: IState): boolean {
        return state instanceof BlockIdleState ||
            state instanceof BlockSwapState ||
            state instanceof BlockFoundState;
    }
    onStateEnter(data: BlockFindEnterData): void {
        let matches = this.findMatch(data);
        let toolsMatches: Block[] = [];
        data.grid.rangeBlocks((block: Block, i: number, j: number) => {
            if (block.match) {
                toolsMatches.push(block);
            }
        });
        if (matches.length > 0 || toolsMatches.length > 0) {
            for (const matchesItem of matches) {
                for (const block of matchesItem) {
                    block.match = true;
                }
            }
            if (this.listener) {
                const totalMatches = [];
                for (const matchesItem of matches) {
                    totalMatches.push(matchesItem)
                }
                if (toolsMatches.length > 0) {
                    totalMatches.push(toolsMatches);
                }
                this.listener.onBlockMatch(totalMatches);
            }

            let foundData = {
                matches: matches,
                toolMatches: toolsMatches,
                grid: data.grid,
                swapBlockFrom: data.swapBlockFrom,
                swapBlockTo: data.swapBlockTo
            } as BlockFoundEnterData;
            this.state.toState(GameStateMgr.ins.blockFound, foundData);
            return;
        }

        if ((data.from as IState) instanceof BlockSwapState) {
            let swapData = {
                fromBlock: data.swapBlockTo,
                toBlock: data.swapBlockFrom,
                grid: data.grid
            } as BlockSwapEnterData;
            this.state.toState(GameStateMgr.ins.blockSwap, swapData);
        } else {
            let enterData = {} as IStateEnterData;
            this.state.toState(GameStateMgr.ins.blockIdle, enterData);
        }
    }

    onStateLeave(): void {

    }

    public findMatch(data: BlockFindEnterData) {
        const threshold = 3;
        let matches = data.grid.findBlockMatches(threshold, (a: Block, b: Block) => {
            if (a.match && b.match) {
                return false;
            }
            if (a.type === BlockType.INVALID) {
                return false;
            }
            if (a.tool || b.tool) {
                return false;
            }
            return a.isSameBlockType(b);
        });
        return matches;
    }

    private conformCanBeMatch(data: BlockFindEnterData, onConfrom: () => void) {
        const randomTool = new RandomTool();
        let toolData: BlockToolEnterData = new BlockToolEnterData();
        toolData.grid = data.grid;
        randomTool.useTool(toolData, () => {
            const matches = this.findMatch(data);
            if (matches.length === 0) {
                this.conformCanBeMatch(data, onConfrom);
            } else {
                onConfrom();
            }
        })
    }
}