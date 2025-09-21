import { Size, Vec2, Vec3, Node, randomRangeInt, UITransform } from 'cc';
import { Cell, CellType, GridItemType } from './Types';

export interface IDropOptions {
    /**
     * 触发下落的回调
     * @param from 要下落的cell 
     * @param to  下落的目标位置
     * @returns 
     */
    onDrop: (from: Cell, to: Cell) => void,

    /**
     * 下落了，就说明有些cell需要被移除
     * @param cell 需要被移除的cell
     * @param index 这一批需要移除的顺序
     * @returns 
     */
    onRemove: (cell: Cell, index: number) => void

    /**
     * 是否需要被移除
     */
    isNeedRemove: (cell: Cell) => boolean
}

/**
 * 显示地图的网格
 */
export class Grid {
    // grid 左下角的实际位置
    lbPos: Vec3;

    // 整个grid的大小 表示横轴有多少个
    cols: number;
    rows: number;
    gridSize: Size;

    // 所有的cell
    cells: Cell[][] = [];
    cellTyps: CellType[] = [];

    // 每个cell的实际大小，单位是屏幕点数，一般根据屏幕宽度计算得到
    cellSize: number;

    // 网格背景，初始化之后不会被改变
    gridItemBg: GridItemType[][];
    constructor(grid: GridItemType[][], cellSize: number, cellTypes: CellType[]) {
        this.rows = grid.length;
        this.cols = grid[0].length;
        this.gridItemBg = grid;

        this.cellSize = cellSize;
        this.gridSize = new Size(this.cols * this.cellSize, this.rows * this.cellSize);
        this.lbPos = new Vec3(0);
        this.cellTyps = cellTypes;

        this.init();

    }

    private init() {
        this.cells = this.createCells(this.cols, this.rows);
    }

    private createCells(rows: number, cols: number): Cell[][] {
        const cells: Cell[][] = [];
        for (let i = 0; i < rows; i++) {
            const row: Cell[] = [];
            for (let j = 0; j < cols; j++) {
                row.push(this.createCell(i, j));
            }
            cells.push(row);
        }
        return cells;
    }

    private createCell(i: number, j: number) {

        let cell = new Cell();
        // 如果Grid是墙壁或者无效，则保持Cell为Invalid
        if (this.canPutNodeGridItem(i, j)) {
            // 随机生成类型
            cell.type = this.randomCellType();
        }
        this.updateCellInfo(i, j, cell);
        return cell;
    }

    public randomCellType(): CellType {
        let index = randomRangeInt(0, this.cellTyps.length);
        return this.cellTyps[index];
    }

    // Grid是否可以放置Cell
    private canPutNodeGridItem(i: number, j: number): boolean {
        const type = this.getGridItemBgType(i, j);
        if (type !== GridItemType.INVALID) {
            return true;
        }
        return false;
    }

    public getGridItemBgType(i: number, j: number): GridItemType {
        return this.gridItemBg[i][j];
    }

    updateCellInfo(i: number, j: number, cell: Cell) {
        // 生成id，用添加的顺序
        cell.gridID = new Vec2(i, j);
        let tempVec2 = new Vec2(0);
        this.gridIDToPos(cell.gridID, tempVec2);

        // 更新位置
        cell.x = tempVec2.x;
        cell.y = tempVec2.y;
    }

    posToGridID(pos: Vec2, out: Vec2) {
        out.x = (pos.x - this.cellSize / 2 + this.gridSize.width / 2) / this.cellSize;
        out.y = (pos.y - this.cellSize / 2 + this.gridSize.height / 2) / this.cellSize;
    }

    gridIDToPos(gridID: Vec2, out: Vec2) {
        // grid 和 cell 的anchor 都是0,0
        let i = gridID.x;
        let j = gridID.y;
        out.x = i * this.cellSize - this.gridSize.width / 2 + this.cellSize / 2;
        out.y = j * this.cellSize - this.gridSize.height / 2 + this.cellSize / 2;
    }

    /**
     * 进行消除检查
     * 规则：
     * 1、横或竖 大于等于三个相同的则会消除
     * 2、横竖共用某一个点时，横竖都会消除，如十或L形状
     * @param threshold 大于等于多少则消除
     * @param isSame 两个Cell认为相同的规则，即可以合并消除的规则
     * @returns 需要消除的cell
     */
    findMatches(threshold: number, isSame: (a: Cell, b: Cell) => boolean): Cell[][] {
        let cells = this.cells;
        const rows = cells.length;
        const cols = cells[0].length;
        const matches: Cell[][] = [];

        // 垂直和水平检查，可能会遇到交叉重复的，如果有重复的进行合并
        const mergeToMatchesFun = (matchesItem: Cell[]) => {
            let haveCrossCell = false;
            for (const items of matches) {
                for (const item of items) {
                    let index = matchesItem.findIndex((value) =>value.gridID === item.gridID);
                    if (index >= 0) {
                        haveCrossCell = true;
                        // console.log("cross happen when find match", matchesItem[index].gridID, matchesItem.length, items.length);
                        // 找到相同的先移除
                        matchesItem.splice(index, 1);
                    }
                }
                if (haveCrossCell) {
                    // 将剩下的合并到已经匹配上的列表
                    matchesItem.forEach( v => items.push(v) )
                    // console.log("cross happen when find match append", matchesItem.length, items.length);
                    return;
                }
            }
            if (!haveCrossCell) {
                matches.push(matchesItem)
            }
        }

        // 搜索水平和垂直方向的匹配
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (cells[i][j].isValid()) {
                    let count = 1;

                    // 搜索水平方向
                    for (let k = j + 1; k < cols && isSame(cells[i][k], cells[i][j]); k++) {
                        count++;
                    }

                    if (count >= threshold) {
                        const matchesItem: Cell[] = [];
                        for (let k = j; k < j + count; k++) {
                            matchesItem.push(cells[i][k]);
                        }
                        mergeToMatchesFun(matchesItem)
                    }

                    // 搜索垂直方向
                    count = 1;
                    for (let k = i + 1; k < rows && isSame(cells[k][j], cells[i][j]); k++) {
                        count++;
                    }

                    if (count >= threshold) {
                        const matchesItem: Cell[] = [];
                        for (let k = i; k < i + count; k++) {
                            matchesItem.push(cells[k][j]);
                        }
                        mergeToMatchesFun(matchesItem)
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
    dropCells(opt: IDropOptions): void {
        let cells = this.cells;
        const rows = cells.length;
        const cols = cells[0].length;

        // 从下往上遍历每一列，将每一列中的空单元格填充为上方第一个非空单元格
        // 最下面是0
        for (let i = 0; i < rows; i++) {
            // 需要下落的cell
            let needDropJ = [];
            let needRemoveJ = [];
            for (let j = 0; j < cols; j++) {
                if (!this.canPutNodeGridItem(i, j)) {
                    // 如果是不允许放东西的grid，则不需要移除也不需要下落
                    continue;
                }
                // 默认不需要移除，就需要下落，也有可能是下落到自身的位置
                if (!opt.isNeedRemove(cells[i][j])) {
                    needDropJ.push(j);
                } else {
                    needRemoveJ.push(j);
                }
            }

            // 从下开始往上找容身之所
            if (needRemoveJ.length > 0 && needDropJ.length > 0) {
                for (let j1 = 0; j1 < cols; j1++) {
                    if (this.canPutNodeGridItem(i, j1)) {
                        if (needDropJ.length > 0){
                            // 从需要下落的列表中依次取出来，下落到可以容身的单元
                            let dropBottom = needDropJ.shift();
                            if (cells[i][j1] !== cells[i][dropBottom]) {
                                opt.onDrop(cells[i][j1], cells[i][dropBottom]);
                                
                                // 位置发生了交换，那么需要移除的位置也会变化
                                for (let ri = 0; ri < needRemoveJ.length; ri++) {
                                    const element = needRemoveJ[ri];
                                    if (element === j1) {
                                        needRemoveJ[ri] = dropBottom;
                                        break;
                                    }
                                    
                                }
                           
                            }
                        }
                    } 
                }
            }

            // 填充剩余的空单元格
            needRemoveJ.forEach(j2 => {
                // 从较远的地方落回来
                opt.onRemove(cells[i][j2], cols);
            });
        }
    }

    findCellByNode(node: Node): Cell {
        if (node === null) {
            return null;
        }
        let cells = this.cells;
        const rows = cells.length;
        const cols = cells[0].length;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (cells[i][j].node === node) {
                    return cells[i][j];
                }
            }
        }
        return null;
    }

    /**
     * 根据位置获取Cell
     * @param locataion 可以是eventTouch.getLoction()
     * @returns 
     */
    findCellByLocaiton(locataion: Vec2): Cell {
        if (locataion === null) {
            return null;
        }
        let cells = this.cells;
        const rows = cells.length;
        const cols = cells[0].length;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (cells[i][j].node &&
                    cells[i][j].node.getComponent(UITransform).getBoundingBoxToWorld().contains(locataion)) {
                    return cells[i][j];
                }
            }
        }
        return null;
    }

    /**
     * 根据方向获取node
     * @param cell 
     * @param dir x y 为 -1,0,1 三个中的一个，可以表达上下左右
     */
    findCellByCellAndDir(cell: Cell, dir: Vec2): Cell {
        if (cell && dir) {
            let i = cell.gridID.x + dir.x;
            let j = cell.gridID.y + dir.y;
            const rows = this.cells.length;
            const cols = this.cells[0].length;

            if (i >= 0 && i < rows &&
                j >= 0 && j < cols) {
                if (this.canPutNodeGridItem(i, j) && this.cells[i][j].node) {
                    return this.cells[i][j];
                }
            }
        }
        return null;
    }

    /**
     * 两个cell是否能交换位置
     * 1. 两个cell相邻就可以交换
     * @param a 
     * @param b 
     * @returns 
     */
    canSwapCell(a: Cell, b: Cell): boolean {
        if (!this.canPutNodeGridItem(a.gridID.x, a.gridID.y) || 
            !this.canPutNodeGridItem(b.gridID.x, b.gridID.y)) {
            console.log("can not swap ",a.gridID, b.gridID);
            return false;
        }
        return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y)) === this.cellSize;
    }

    /**
     * 交換兩個Cell， 只是交换，Cell的位置 需要自行更新
     * @param a 
     * @param b 
     */
    swapCell(a: Cell, b: Cell) {
        // 更新在cells中的位置
        this.cells[a.gridID.x][a.gridID.y] = b;
        this.cells[b.gridID.x][b.gridID.y] = a;

        // 交換grid id，
        let tempGridId = b.gridID.clone();
        b.gridID.x = a.gridID.x;
        b.gridID.y = a.gridID.y;

        a.gridID.x = tempGridId.x;
        a.gridID.y = tempGridId.y;
    }

    rangeCells(itor: (c: Cell, i: number, j: number) => void) {
        let cells = this.cells;
        const rows = cells.length;
        const cols = cells[0].length;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                itor(cells[i][j], i, j);
            }
        }
    }
}
