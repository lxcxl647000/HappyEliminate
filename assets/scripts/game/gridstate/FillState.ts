import { IEnterData, IState, StateWithMachine } from "../util/StateMachine";
import { FindMatchState, FindMatchStateEnterData } from "./FindMatchState";
import { Grid } from "../Grid";
import { Cell } from "../Types";
import { Vec2 } from "cc";
import { ConstStatus } from "./ConstStatus";
import { RowMatchTool } from "../tools/RowMatchTool";
import { ITool } from "../tools/ITool";
import { BoomMatchTool } from "../tools/BoomMatchTool";
import { BoomUpMatchTool } from "../tools/BoomUpMatchTool";
import { ColMatchTool } from "../tools/ColMatchTool";
import { CellScript } from "../../custom/gamepanel/CellScript";

export class FillStateEnterData extends IEnterData {
    matches: Cell[][]; // 匹配找到的，用来计算要不要生成道具
    grid: Grid;
    // 如果是手势操作带来的消除后填充，可以补充这俩值，用来判断生成道具的位置
    swapCellFrom?: Cell;
    swapCellTo?: Cell;
}

/**
 * 创建新的 元素
 */
export class FillState extends StateWithMachine {
    private fillNewNode: (cell: Cell) => void;
    public setFillNewNodeFun(fillNewNode: (cell: Cell) => void) {
        this.fillNewNode = fillNewNode;
    }
    getName(): string {
        return 'FillState';
    }
    canTransitionTo(state: IState): boolean {
        return state instanceof FindMatchState;
    }
    onEnter(data: FillStateEnterData): void {
        // 如果有指定生成的内容，直接进行生成
        this.checkToGenerateTools(data);

        // 遍历查看是否需要填充新内容
        data.grid.dropCells({
            onDrop: (from: Cell, to: Cell) => {
                // 下落直接替换node, 把目标位置的node和类型之间进行调整
                data.grid.swapCell(from, to);
            },
            onRemove: (cell: Cell, index: number) => {
                // Cell的位置，可以整体往Grid外侧移动，
                // 这样在移动动画中，就可以让生成的Cell全部都从Grid外侧动画进入到Grid单位
                let outPos = new Vec2();
                // 用+ 是因为左下角是（0,0）
                data.grid.gridIDToPos(new Vec2(cell.gridID.x, data.grid.rows + index + 1), outPos);
                cell.x = outPos.x;
                // cell.y = outPos.y;
                cell.y = data.grid.cellSize + data.grid.gridSize.height / 2;

                // 消除了创建一个新的Cell
                cell.type = data.grid.randomCellType();
                this.fillNewNode(cell);
            },
            isNeedRemove: (cell: Cell) => {
                // fill主要是增加node， 如果是有效的而且node为空则需要添加
                return cell.isValid() && cell.node === null;
            }
        });

        // 触发移动
        this.checkAndMoveCell(data);
    }

    /**
     * 如果Cell 和目标grid的位置不一样，则进行移动
     */
    private checkAndMoveCell(data: FillStateEnterData): void {
        let needMoveCount = 0;
        let haveMovedCount = 0;

        let vec2Temp = new Vec2(0);
        data.grid.rangeCells((cell: Cell, i: number, j: number) => {
            if (cell.node) {
                // 如果位置和Grid单元不一致，则进行移动操作
                data.grid.gridIDToPos(cell.gridID, vec2Temp);
                if (cell.x !== vec2Temp.x || cell.y !== vec2Temp.y) {
                    needMoveCount++;
                }
            }

        });
        console.log("need move ", needMoveCount);
        if (needMoveCount === 0) {
            console.error("need move is zeor error to idel", needMoveCount);
            // error
            // 没有需要移除的，直接跳转
            this.stateMachine.transitionTo(
                ConstStatus.getInstance().errorState,
                {
                } as IEnterData
            );
            return;
        }

        data.grid.rangeCells((cell: Cell, i: number, j: number) => {
            if (cell.node) {
                // 如果位置和Grid单元不一致，则进行移动操作
                data.grid.gridIDToPos(cell.gridID, vec2Temp);
                if (cell.x !== vec2Temp.x || cell.y !== vec2Temp.y) {
                    cell.x = vec2Temp.x;
                    cell.y = vec2Temp.y;
                    // 触发移动
                    let cellScript = cell.node.getComponent(CellScript);
                    cellScript.setPosition(cell.x, cell.y, true, () => {
                        // 移动完成
                        haveMovedCount++;
                        if (haveMovedCount === needMoveCount) {
                            console.log('fill finish');
                            // 下落完成进入下一个状态
                            this.stateMachine.transitionTo(
                                ConstStatus.getInstance().findMatchState,
                                {
                                    grid: data.grid
                                } as FindMatchStateEnterData
                            );
                        }
                    });
                }
            }
        });
    }
    onLeave(): void {
    }

    /**
     * 根据消除的内容查看是否需要生成道具
     * 1、横或竖 等于4个，则生成一个 横向的道具
     * 2、L 或者 T型 则生成炸弹
     */
    private checkToGenerateTools(data: FillStateEnterData) {
        if (data.matches.length > 0) {
            for (const matchesItem of data.matches) {
                // console.log("checkToGenerateTools ", matchesItem.length);
                let rowIndexSameCounter = 0;
                let colIndexSameCounter = 0;
                const firstGridID = matchesItem[0].gridID;
                for (const m of matchesItem) {
                    if (m.gridID.x === firstGridID.x) {
                        rowIndexSameCounter++;
                    }
                    if (m.gridID.y === firstGridID.y) {
                        colIndexSameCounter++;
                    }
                }

                // 道具生成的位置，和当前交换的位置相同，如果不是交换触发则去第一个
                let cell = matchesItem[0];
                if (data.swapCellFrom && data.swapCellTo) {
                    for (const matchesItemTemp of matchesItem) {
                        if (matchesItemTemp.gridID === data.swapCellFrom.gridID) {
                            cell = data.swapCellFrom;
                            break;
                        }
                        if (matchesItemTemp.gridID === data.swapCellTo.gridID) {
                            cell = data.swapCellTo;
                            break;
                        }
                    }
                }
                // 如果横向或者纵向等于总数，则说明是一条直线
                if (rowIndexSameCounter === matchesItem.length || colIndexSameCounter === matchesItem.length) {
                    // 连续4个相同（或以上）
                    if (rowIndexSameCounter === 4) {
                        this.fillWithTool(cell, new RowMatchTool());
                    } else if (colIndexSameCounter === 4) {
                        this.fillWithTool(cell, new ColMatchTool());
                    }
                    // else if (rowIndexSameCounter >= 5 || colIndexSameCounter >= 5) {
                    //     this.fillWithTool(cell, new BoomUpMatchTool());
                    // }
                } else {
                    // 可能是T 或L
                    this.fillWithTool(cell, new BoomMatchTool())
                }
            }
        }
    }
    private fillWithTool(cell: Cell, tool: ITool) {
        cell.tool = tool;
        this.fillNewNode(cell);
    }
}