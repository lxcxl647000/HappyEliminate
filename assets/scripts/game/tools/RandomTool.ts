import { randomRangeInt } from "cc";
import { BlockToolEnterData } from "../state/BlockToolState";
import { GameUtils } from "../GameUtils";
import { Block } from "../Block";
import { ITool, ToolType } from "../GameConstant";

export class RandomTool implements ITool {
    getToolType(): ToolType {
        return ToolType.Random
    }

    useTool(data: BlockToolEnterData, onComplete: Function) {
        const blocks: Block[] = [];
        data.grid.rangeBlocks((c: Block, i: number, j: number) => {
            if (c.isValid()) {
                blocks.push(c);
            }
        });

        for (const c of blocks) {
            let randomBlock = blocks[randomRangeInt(0, blocks.length)];
            data.grid.swapBlock(c, randomBlock);
        }

        for (let index = 0; index < blocks.length; index++) {
            const block = blocks[index];
            if (index === blocks.length - 1) {
                GameUtils.updateBlockPos(block, data.grid, onComplete);
            } else {
                GameUtils.updateBlockPos(block, data.grid);
            }
        }
    }
}