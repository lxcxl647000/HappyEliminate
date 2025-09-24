import { _decorator, Component, instantiate, Node, Prefab, Sprite, UITransform, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

import { Size } from 'cc';
import { CellScript } from './CellScript';
import { GridItemBGScript } from './GridItemBGScript';
import { Cell } from '../../game/Types';
import { Grid } from '../../game/Grid';
import { StateMachine } from '../../game/util/StateMachine';
import { Level } from '../../game/Level';
import { Constants } from '../../game/Constants';
import { ConstStatus } from '../../game/gridstate/ConstStatus';
import { IdelState } from '../../game/gridstate/IdelState';
import { SwapState } from '../../game/gridstate/SwapState';
import { FoundMatchState } from '../../game/gridstate/FoundMatchState';
import { FillState } from '../../game/gridstate/FillState';
import { RemoveState } from '../../game/gridstate/RemoveState';
import { TouchMoveState, TouchMoveStateEnterData } from '../../game/gridstate/TouchMoveState';
import { FindMatchState, FindMatchStateEnterData } from '../../game/gridstate/FindMatchState';
import { ToolsState, ToolsStateEnterData } from '../../game/gridstate/ToolsState';
import { ErrorState } from '../../game/gridstate/ErrorState';
import { ITool, ToolType } from '../../game/tools/ITool';
import { RandomTool } from '../../game/tools/RandomTool';
import { HammerTool } from '../../game/tools/HammerTool';
import { StepsTool } from '../../game/tools/StepsTool';
import { BoomTool } from '../../game/tools/BoomTool';


export interface GridListener {

    /**
     * 手势触发，位置交换时候回调, 无论成功还是失败，都会回调
     * @param from 
     * @param to 
     * @returns 
     */
    onSwapStep: (from: Cell, to: Cell) => void;

    /**
     * 触发消除的时候进行回调， 无论是手势还是自动下落触发的都会回调
     * 可能会回调多次
     * @param cells 本次消除的所有Cell
     * @returns 
     */
    onMatch: (cells: Cell[][]) => void;

    /**
     * 新增的消除已经完成，当前页面变得稳定
     * @returns 
     */
    onStable: () => void;

}

@ccclass('LevelGridLayout')
export class LevelGridLayout extends Component {

    @property(Prefab)
    cellPrefab: Prefab

    @property(Prefab)
    gridBgPrefab: Prefab;

    grid: Grid;

    stopWorld: boolean = true;

    // 上一次单击的cell
    clickCell1: Cell;
    clickCell2: Cell;
    clickSwaping: boolean = false;

    // 事件回调监听
    listener: GridListener = null;

    private gridStateMachine: StateMachine;

    public init(levelConfig: Level) {
        this.grid = new Grid(levelConfig.grid, Constants.GRID_CELL_SIZE, levelConfig.types);
        this.initGridCells();
        this.stopWorld = false;

        // 初始化消除状态
        ConstStatus.getInstance().idelState = new IdelState();
        this.gridStateMachine = new StateMachine(ConstStatus.getInstance().idelState);
    }

    start() {
        // 初始化所有的状态
        ConstStatus.getInstance().idelState.setListener(this.listener);

        ConstStatus.getInstance().swapState = new SwapState(this.gridStateMachine);
        ConstStatus.getInstance().swapState.setListener(this.listener);

        ConstStatus.getInstance().foundMatchState = new FoundMatchState(this.gridStateMachine);
        ConstStatus.getInstance().fillState = new FillState(this.gridStateMachine);
        ConstStatus.getInstance().fillState.setFillNewNodeFun(this.initCellAndNode.bind(this));
        ConstStatus.getInstance().removeState = new RemoveState(this.gridStateMachine);


        ConstStatus.getInstance().touchMoveState = new TouchMoveState(this.gridStateMachine);

        ConstStatus.getInstance().findMatchState = new FindMatchState(this.gridStateMachine);
        ConstStatus.getInstance().findMatchState.setListener(this.listener);

        ConstStatus.getInstance().toolsState = new ToolsState(this.gridStateMachine);
        ConstStatus.getInstance().errorState = new ErrorState(this.gridStateMachine);

        // 初始化完成后进行检查
        this.gridStateMachine.transitionTo(
            ConstStatus.getInstance().findMatchState,
            {
                grid: this.grid
            } as FindMatchStateEnterData);
    }

    update(deltaTime: number) {
        if (this.stopWorld) {
            this.node.removeAllChildren();
            return;
        }
        this.gridStateMachine.processQueue();
    }

    public stop() {
        this.stopWorld = true;
    }

    public setGridListener(listener: GridListener) {
        this.listener = listener;
    }

    //如果cell没有node 就添加一个
    private initGridCells() {
        const rows = this.grid.cells.length;
        const cols = this.grid.cells[0].length;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                // 每个grid都加上一个背景
                let cell = this.grid.cells[i][j];
                let nodeSize = new Size(this.grid.cellSize * Constants.GRID_CELL_BG_SIZE_SCALE,
                    this.grid.cellSize * Constants.GRID_CELL_BG_SIZE_SCALE);
                let node = instantiate(this.gridBgPrefab);
                node.getComponent(UITransform).setContentSize(nodeSize);
                node.setPosition(cell.x, cell.y)

                // 设置背景的内容
                node.getComponent(GridItemBGScript).setType(this.grid.getGridItemBgType(i, j))

                this.node.addChild(node);
            }
        };

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                let cell = this.grid.cells[i][j];
                // 初始化时候使用cell的位置，可以减少动画
                this.initCellAndNode(cell);
            }
        };
    }

    /**
     * 初始化cell 
     * 初始化类型，设置为未匹配， 增加node
     * @param cell 
     */
    private initCellAndNode(cell: Cell) {
        cell.node = this.createAndAddCellNode(cell);
    }

    /**
     * 创建cell
     * @returns 
     */
    private createAndAddCellNode(cell: Cell): Node {
        let nodeSize = new Size(this.grid.cellSize * Constants.GRID_CELL_SIZE_SCALE,
            this.grid.cellSize * Constants.GRID_CELL_SIZE_SCALE);
        let node = instantiate(this.cellPrefab)
        let nodeSpriteTransform = node.getComponent(Sprite).getComponent(UITransform)
        let nodeSacle = new Vec3(nodeSize.width / nodeSpriteTransform.width, nodeSize.height / nodeSpriteTransform.height, 1);
        // 修改scale 可以让node的子元素也变化
        node.setScale(nodeSacle);
        this.node.addChild(node);

        // 添加单击事件回调
        let cellScript = node.getComponent(CellScript);
        // 初始化类型和位置
        cellScript.setType(cell.type);
        // for test tool
        // let rand = randomRangeInt(0, 10)
        // if (rand > 7) {
        //     cell.tool = new RowMatchTool()
        // } else if (rand > 5) {
        //     cell.tool = new BoomMatchTool()
        // }
        if (cell.tool) {
            cellScript.setToolType(cell.tool.getType());
        } else {
            cellScript.setToolType(ToolType.INVALID);
        }


        cellScript.setPosition(cell.x, cell.y, false);

        cellScript.setOnClickListener({
            onClick: (node: Node) => {
                // 如果不是idel不允许操作
                if (!(this.gridStateMachine.getCurrentState() instanceof IdelState)) {
                    this.resetClickSwap();
                    return;
                }
                let cell = this.grid.findCellByNode(node);
                // 如果选中了道具，则需要进行一次道具触发
                if (cell.tool) {
                    // 选中了道具，进行处理
                    // 跳转state
                    this.gridStateMachine.transitionTo(
                        ConstStatus.getInstance().toolsState,
                        {
                            cell: cell,
                            tool: cell.tool,
                            grid: this.grid
                        } as ToolsStateEnterData
                    );
                } else {
                    this.prepareClickSwap(cell);
                }
            },
            onMoveDirection: (node: Node, dir: Vec2) => {
                // 如果不是idel不允许操作
                if (!(this.gridStateMachine.getCurrentState() instanceof IdelState)) {
                    this.resetClickSwap();
                    return;
                }
                this.resetClickSwap();
                let cell1 = this.grid.findCellByNode(node);
                let cell2 = this.grid.findCellByCellAndDir(cell1, dir);

                if (cell1 && cell2) {
                    this.clickCell1 = cell1;
                    this.clickCell2 = cell2;
                    this.processClickSwap();
                } else {
                    this.resetClickSwap();
                }
            }
        })
        return node;
    }

    private prepareClickSwap(cell: Cell) {
        if (!cell) {
            // 点到了无效的cell，重置记录
            this.resetClickSwap();
            return;
        }
        console.log("choose cell", cell.gridID.x, cell.gridID.y, cell);
        if (!this.clickCell1) {
            this.clickCell1 = cell;
            this.setSelectCell(this.clickCell1, true);
        } else {
            this.clickCell2 = cell;
            this.processClickSwap();
        }
    }

    private setSelectCell(cell: Cell, selected: boolean) {
        if (cell && cell.node) {
            let cellScript = cell.node.getComponent(CellScript);
            cellScript.setSelect(selected);
        }
    }

    private resetClickSwap() {
        this.clickSwaping = false;
        this.setSelectCell(this.clickCell1, false);
        this.setSelectCell(this.clickCell2, false);
        this.clickCell1 = null;
        this.clickCell2 = null;
    }

    private processClickSwap(): boolean {
        if (!this.clickSwaping && this.clickCell1 && this.clickCell2) {
            if (this.grid.canSwapCell(this.clickCell1, this.clickCell2)) {
                this.clickSwaping = true;
                // 跳转state
                this.gridStateMachine.transitionTo(
                    ConstStatus.getInstance().touchMoveState,
                    {
                        cell1: this.clickCell1,
                        cell2: this.clickCell2,
                        grid: this.grid
                    } as TouchMoveStateEnterData
                );
                // 跳转完成即可重置记录
                this.resetClickSwap();

                return true;
            } else {
                // 选种了，但是不能消除，清空选中记录
                this.resetClickSwap();
            }
        }
        return false;
    }

    useRandomTool(tool: ITool) {
        this.gridStateMachine.transitionTo(
            ConstStatus.getInstance().toolsState,
            {
                cell: null,
                grid: this.grid,
                tool: tool
            } as ToolsStateEnterData
        );
    }

    /**
     * 随机打乱网格, 随机的交换
     */
    randomGrid() {
        console.log("random grid");
        this.useRandomTool(new RandomTool())
    }

    useHammerTool() {
        this.gridStateMachine.transitionTo(
            ConstStatus.getInstance().toolsState,
            {
                cell: null,
                grid: this.grid,
                tool: new HammerTool()
            } as ToolsStateEnterData
        );
    }

    useStepsTool() {
        this.gridStateMachine.transitionTo(
            ConstStatus.getInstance().toolsState,
            {
                cell: null,
                grid: this.grid,
                tool: new StepsTool()
            } as ToolsStateEnterData
        );
    }

    useBoomTool() {
        this.gridStateMachine.transitionTo(
            ConstStatus.getInstance().toolsState,
            {
                cell: null,
                grid: this.grid,
                tool: new BoomTool()
            } as ToolsStateEnterData
        );
    }
}


