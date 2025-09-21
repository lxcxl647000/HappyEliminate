import { Grid } from "../Grid";
import { Cell } from "../Types";
import { ITool } from "../tools/ITool";
import { IEnterData, IState, StateWithMachine } from "../util/StateMachine";
import { ConstStatus } from "./ConstStatus";
import { FindMatchState, FindMatchStateEnterData } from "./FindMatchState";


export class ToolsStateEnterData extends IEnterData {
    cell: Cell; // 触发道具的位置， 可能为空
    tool: ITool;
    grid: Grid;
}


/**
 * 使用了道具，需要计算那些需要消除
 * 1、交换是触发道具
 * 2、直接触发道具
 */
export class ToolsState extends StateWithMachine {
    getName(): string {
        return 'ToolsState';
    }
    canTransitionTo(state: IState): boolean {
        return state instanceof FindMatchState ||
            state instanceof ToolsState;
    }
    onEnter(data: ToolsStateEnterData): void {
        // 使用道具，道具执行完成之后，开始一轮匹配
        // 有些道具会将某些Cell设置成已匹配
        data.tool.process(data.cell, data.grid, () => {
            // 道具已使用，将道具移除
            if (data.cell) {
                data.cell.tool = null;
            }
            // 如果道具消除了另一个道具，再触发一次道具消除
            data.grid.rangeCells((c: Cell, i: number, j: number) => {
                if (c.match && c.tool) {
                    this.stateMachine.transitionTo(
                        ConstStatus.getInstance().toolsState,
                        {
                            cell: c,
                            tool: c.tool,
                            grid: data.grid
                        } as ToolsStateEnterData
                    );
                    return;
                }
            });

            // 消除中没有道具了，跳转到下一个状态
            this.stateMachine.transitionTo(
                ConstStatus.getInstance().findMatchState,
                {
                    grid: data.grid
                } as FindMatchStateEnterData
            );
        });

    }
    onLeave(): void {

    }
}