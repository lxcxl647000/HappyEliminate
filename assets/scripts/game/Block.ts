import { _decorator, Node, Vec2 } from 'cc';
import { BlockType, ITool } from './GameConstant';

export class Block {
    x: number;
    y: number;
    blockNode: Node = null;
    blockGridID: Vec2;
    type: BlockType = BlockType.INVALID;
    tool: ITool = null;
    match: boolean = false;

    isSameBlockType(block: Block) {
        return this.type == block.type;
    }

    isValid() {
        return this.type !== BlockType.INVALID;
    }
}