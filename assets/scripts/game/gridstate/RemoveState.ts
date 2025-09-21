import { CellScript } from "../../custom/gamepanel/CellScript";
import { Grid } from "../Grid";
import { Cell } from "../Types";
import { IEnterData, IState, StateWithMachine } from "../util/StateMachine";
import { ConstStatus } from "./ConstStatus";
import { FillState, FillStateEnterData } from "./FillState";

export class RemoveStateEnterData extends IEnterData {
    matches: Cell[][]; // 匹配找到的
    toolMatches: Cell[]; // 道具强制移除的
    grid: Grid;
    // 如果是手势操作带来的消除，可以补充这俩值，用来判断生成道具的位置
    swapCellFrom?: Cell;
    swapCellTo?: Cell;
}

export class RemoveState extends StateWithMachine {
    getName(): string {
        return 'RemoveState';
    }
    canTransitionTo(state: IState): boolean {
        return state instanceof FillState;
    }
    onEnter(data: RemoveStateEnterData): void {
        let grid = data.grid;
        let needRemoveCount = 0;
        let hadRemovedCount = 0;

        // 计算需要消除的数量
        grid.rangeCells((cell: Cell, i: number, j: number) => {
            if (cell.match && cell.node) {
                needRemoveCount++;
            }
        });
        console.log("need remove count", needRemoveCount);
        // 开始消除
        grid.rangeCells((cell: Cell, i: number, j: number) => {
            if (cell.match && cell.node) {
                let cellScript = cell.node.getComponent(CellScript);
                // disappear会移除node
                // 所以cell.node已经无用置空处理
                cell.node = null;
                
                cellScript.disappear(() => {
                    hadRemovedCount++;
                    if (hadRemovedCount === needRemoveCount) {
                        // 全部消除完成
                        console.log('remove finish !');
                        // 消除完成，进入下一个状态
                        this.stateMachine.transitionTo(
                            ConstStatus.getInstance().fillState,
                            {
                                matches: data.matches,
                                grid: data.grid,
                                swapCellFrom: data.swapCellFrom,
                                swapCellTo: data.swapCellTo
                            } as FillStateEnterData);
                    }
                });
                
            }
            // 消除的时候，设置装为未未匹配
            cell.match = false;
        });
    }

    onLeave(): void {

    }
}