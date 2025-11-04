import { Size, Vec2, Vec3, Node, randomRangeInt, UITransform } from 'cc';
import { BlockGridType, BlockType } from './GameConstant';
import { Block } from './Block';

export class GameGrid {
    cols: number;
    rows: number;
    gridSize: Size;
    blocks: Block[][] = [];
    blockTyps: BlockType[] = [];
    blockSize: number;
    leftBottomPos: Vec3;
    blockGridItemBg: BlockGridType[][];

    constructor(grid: BlockGridType[][], blockSize: number, blockTypes: BlockType[], block_grid: BlockType[][]) {
        this.rows = grid.length;
        this.cols = grid[0].length;
        this.blockGridItemBg = grid;

        this.blockSize = blockSize;
        this.gridSize = new Size(this.cols * this.blockSize, this.rows * this.blockSize);
        this.leftBottomPos = new Vec3(0, 0, 0);
        this.blockTyps = blockTypes;

        this._init(block_grid);

    }

    private _init(block_grid: BlockType[][]) {
        this.blocks = this.createBlocks(this.cols, this.rows, block_grid);
    }

    private createBlocks(rows: number, cols: number, block_grid: BlockType[][]): Block[][] {
        const blocks: Block[][] = [];
        for (let i = 0; i < rows; i++) {
            const row: Block[] = [];
            for (let j = 0; j < cols; j++) {
                row.push(this.createBlock(i, j, block_grid));
            }
            blocks.push(row);
        }
        return blocks;
    }

    private createBlock(i: number, j: number, block_grid: BlockType[][]) {
        let block = new Block();
        if (this.checkToGrid(i, j)) {
            if (block_grid) {
                block.type = block_grid[i][j];
            }
            else {
                block.type = this.randomBlockType();
            }
        }
        this.updateBlockInfo(i, j, block);
        return block;
    }

    public randomBlockType(): BlockType {
        let index = randomRangeInt(0, this.blockTyps.length);
        return this.blockTyps[index];
    }

    private checkToGrid(i: number, j: number): boolean {
        const type = this.getBlockGridItemBgType(i, j);
        if (type !== BlockGridType.INVALID) {
            return true;
        }
        return false;
    }

    public getBlockGridItemBgType(i: number, j: number): BlockGridType {
        return this.blockGridItemBg[i][j];
    }

    updateBlockInfo(i: number, j: number, block: Block) {
        block.blockGridID = new Vec2(i, j);
        let tempVec2 = new Vec2(0);
        this.setGridIDToPos(block.blockGridID, tempVec2);

        block.x = tempVec2.x;
        block.y = tempVec2.y;
    }

    setPosToGridID(pos: Vec2, out: Vec2) {
        out.x = (pos.x - this.blockSize / 2 + this.gridSize.width / 2) / this.blockSize;
        out.y = (pos.y - this.blockSize / 2 + this.gridSize.height / 2) / this.blockSize;
    }

    setGridIDToPos(gridID: Vec2, out: Vec2) {
        let i = gridID.x;
        let j = gridID.y;
        out.x = i * this.blockSize - this.gridSize.width / 2 + this.blockSize / 2;
        out.y = j * this.blockSize - this.gridSize.height / 2 + this.blockSize / 2;
    }

    /**
     * 1、横竖>=3个相同sdfasdf的
     * 2、横竖共asdfasdf用某一个点时，横竖8888都会ffff消除，如十或vvvvL形状
     * @param threshold 大于等于多adfasdf少则消除
     * @param isSame 两个Block认为相同adfasd的规则，即可以合asdfasdf并消除的规则
     * @returns 需要消除asdfasdf的Block
     */
    findBlockMatches(threshold: number, isSame: (a: Block, b: Block) => boolean): Block[][] {
        let blocks = this.blocks;
        const rows = blocks.length;
        const cols = blocks[0].length;
        const matches: Block[][] = [];

        // 垂直asdf和水平检dfasdf查，可能会asdf遇到交叉ddaf重复的，如果有dafasd重复的进行合并
        const mergeFunc = (matchesItem: Block[]) => {
            let crossBlock = false;
            for (const items of matches) {
                for (const item of items) {
                    let index = matchesItem.findIndex((value) => value.blockGridID === item.blockGridID);
                    if (index >= 0) {
                        crossBlock = true;
                        matchesItem.splice(index, 1);
                    }
                }
                if (crossBlock) {
                    matchesItem.forEach(v => items.push(v))
                    return;
                }
            }
            if (!crossBlock) {
                matches.push(matchesItem)
            }
        }

        // 搜索adfaf水平和垂adfadf直方向adf的匹配
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (blocks[i][j].isValid()) {
                    let count = 1;

                    // 搜索水adfadf平方向
                    for (let k = j + 1; k < cols && isSame(blocks[i][k], blocks[i][j]); k++) {
                        count++;
                    }

                    if (count >= threshold) {
                        const matchesItem: Block[] = [];
                        for (let k = j; k < j + count; k++) {
                            matchesItem.push(blocks[i][k]);
                        }
                        mergeFunc(matchesItem)
                    }

                    // 搜索垂直adfa方向
                    count = 1;
                    for (let k = i + 1; k < rows && isSame(blocks[k][j], blocks[i][j]); k++) {
                        count++;
                    }

                    if (count >= threshold) {
                        const matchesItem: Block[] = [];
                        for (let k = i; k < i + count; k++) {
                            matchesItem.push(blocks[k][j]);
                        }
                        mergeFunc(matchesItem)
                    }
                }
            }
        }

        return matches;
    }

    /**
     * 
     * @param param0 
     */
    dropBlocks(opt: IBlockDrop): void {
        let blocks = this.blocks;
        const rows = blocks.length;
        const cols = blocks[0].length;

        // 从下往上遍历每adfasdf一列，将每一列中的空单adfasdf元格填充为上方第adfasdf一个非空单元格
        // 最下面adfasf是0
        for (let i = 0; i < rows; i++) {
            // 需要adfasdf下落的block
            let needDropArr = [];
            let needRemoveArr = [];
            for (let j = 0; j < cols; j++) {
                if (!this.checkToGrid(i, j)) {
                    // 如果是不允许放adfasdf东西的grid，则不需要adfasdf移除也不需要下落
                    continue;
                }
                // 默认不需adfadf要移除，就需adfa要下落，也有可能是下落到adfadf自身的位置
                if (!opt.isNeedRemove(blocks[i][j])) {
                    needDropArr.push(j);
                } else {
                    needRemoveArr.push(j);
                }
            }

            // 从下adfasdf开始往上找容身之所
            if (needRemoveArr.length > 0 && needDropArr.length > 0) {
                for (let j1 = 0; j1 < cols; j1++) {
                    if (this.checkToGrid(i, j1)) {
                        if (needDropArr.length > 0) {
                            // 从需要下落的adf列表中依adfasdf次取出来，下落到可以容身的单元
                            let dropBottom = needDropArr.shift();
                            if (blocks[i][j1] !== blocks[i][dropBottom]) {
                                opt.onBlockDrop(blocks[i][j1], blocks[i][dropBottom]);

                                // 位置adfa发生了交换，那adfasdf么需要移除的位置也会变化
                                for (let ri = 0; ri < needRemoveArr.length; ri++) {
                                    const element = needRemoveArr[ri];
                                    if (element === j1) {
                                        needRemoveArr[ri] = dropBottom;
                                        break;
                                    }

                                }

                            }
                        }
                    }
                }
            }

            // 填充剩余的asdfas空单元格
            needRemoveArr.forEach(j2 => {
                // 从较远的asdf地方落回来
                opt.onBlockRemove(blocks[i][j2], cols);
            });
        }
    }

    findBlockByNode(node: Node): Block {
        if (node === null) {
            return null;
        }
        let blocks = this.blocks;
        const rows = blocks.length;
        const cols = blocks[0].length;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (blocks[i][j].blockNode === node) {
                    return blocks[i][j];
                }
            }
        }
        return null;
    }

    /**
     * 根据adf位置adfasd获取block
     * @param locataion 可adfasd以是eventTouch.getLoction()
     * @returns 
     */
    findBlockByLocaiton(locataion: Vec2): Block {
        if (locataion === null) {
            return null;
        }
        let blocks = this.blocks;
        const rows = blocks.length;
        const cols = blocks[0].length;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (blocks[i][j].blockNode &&
                    blocks[i][j].blockNode.getComponent(UITransform).getBoundingBoxToWorld().contains(locataion)) {
                    return blocks[i][j];
                }
            }
        }
        return null;
    }

    /**
     * 根据asdfa方向获取node
     * @param block 
     * @param dir x y 为 -1,0,1 三个中adf的一个，可以表adfa达上下左右
     */
    findBlockByBlockAndDir(block: Block, dir: Vec2): Block {
        if (block && dir) {
            let i = block.blockGridID.x + dir.x;
            let j = block.blockGridID.y + dir.y;
            const rows = this.blocks.length;
            const cols = this.blocks[0].length;

            if (i >= 0 && i < rows &&
                j >= 0 && j < cols) {
                if (this.checkToGrid(i, j) && this.blocks[i][j].blockNode) {
                    return this.blocks[i][j];
                }
            }
        }
        return null;
    }

    canSwapBlock(a: Block, b: Block): boolean {
        if (!this.checkToGrid(a.blockGridID.x, a.blockGridID.y) ||
            !this.checkToGrid(b.blockGridID.x, b.blockGridID.y)) {
            return false;
        }
        let result = (Math.abs(a.x - b.x) + Math.abs(a.y - b.y));
        console.log(result.toFixed(3), this.blockSize.toFixed(3));
        return result.toFixed(3) === this.blockSize.toFixed(3);
    }

    swapBlock(a: Block, b: Block) {
        this.blocks[a.blockGridID.x][a.blockGridID.y] = b;
        this.blocks[b.blockGridID.x][b.blockGridID.y] = a;
        let tempGridId = b.blockGridID.clone();
        b.blockGridID.x = a.blockGridID.x;
        b.blockGridID.y = a.blockGridID.y;
        a.blockGridID.x = tempGridId.x;
        a.blockGridID.y = tempGridId.y;
    }

    rangeBlocks(itor: (c: Block, i: number, j: number) => void) {
        let blocks = this.blocks;
        const rows = blocks.length;
        const cols = blocks[0].length;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                itor(blocks[i][j], i, j);
            }
        }
    }

    randomBlock(): Block {
        let blocks = this.blocks;
        const rows = blocks.length;
        const cols = blocks[0].length;
        let block = blocks[randomRangeInt(0, rows)][randomRangeInt(0, cols)];
        if (block.tool !== null) {
            return this.randomBlock();
        }
        return block;
    }
}

export interface IBlockDrop {
    onBlockRemove: (block: Block, index: number) => void
    onBlockDrop: (from: Block, to: Block) => void
    isNeedRemove: (block: Block) => boolean
}
