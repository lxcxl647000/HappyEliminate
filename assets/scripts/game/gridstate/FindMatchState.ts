import { IdelState } from "./IdelState";
import { FoundMatchState, FoundMatchStateEnterData } from "./FoundMatchState";
import { SwapState, SwapStateEnterData } from "./SwapState";
import { Cell, CellType } from "../Types";
import { Grid } from "../Grid";
import { ConstStatus } from "./ConstStatus";
import { RandomTool } from "../tools/RandomTool";
import { GridListener } from "../../custom/gamepanel/LevelGridLayout";
import { IEnterData, IState, StateWithMachine } from "../util/StateMachine";

export class FindMatchStateEnterData extends IEnterData {
    swapCellFrom?: Cell;
    swapCellTo?: Cell;
    grid: Grid;
}


export class FindMatchState extends StateWithMachine {
    private listener: GridListener;

    public setListener(listener: GridListener) {
        this.listener = listener;
    }
    getName(): string {
        return 'FindMatchState';
    }

    canTransitionTo(state: IState): boolean {
        return state instanceof IdelState ||
            state instanceof SwapState ||
            state instanceof FoundMatchState;
    }
    onEnter(data: FindMatchStateEnterData): void {
        // 进行匹配查找
        // 检查是否可以消除
        let matches = this.findMatch(data);

        // 有些是道具直接设置为匹配, 进行一轮检查
        let toolsMatches: Cell[] = [];
        data.grid.rangeCells((cell: Cell, i: number, j: number) => {
            if (cell.match) {
                toolsMatches.push(cell);
            }
        });
        if (matches.length > 0 || toolsMatches.length > 0) {
            for (const matchesItem of matches) {
                for (const cell of matchesItem) {
                    cell.match = true;
                }
            }
            if (this.listener) {
                // 回调的时候合并 道具和匹配消除的
                const totalMatches = [];
                for (const matchesItem of matches) {
                    totalMatches.push(matchesItem)
                }
                if (toolsMatches.length > 0) {
                    totalMatches.push(toolsMatches);
                }
                this.listener.onMatch(totalMatches);
            }

            // 如果找到了直接跳转并退出
            this.stateMachine.transitionTo(
                ConstStatus.getInstance().foundMatchState,
                {
                    matches: matches,
                    toolMatches: toolsMatches,
                    grid: data.grid,
                    swapCellFrom: data.swapCellFrom,
                    swapCellTo: data.swapCellTo
                } as FoundMatchStateEnterData
            );
            return;
        }


        // 如果是swap过来的则需要回到swap
        if ((data.from as IState) instanceof SwapState) {
            this.stateMachine.transitionTo(
                ConstStatus.getInstance().swapState,
                {
                    fromCell: data.swapCellTo, // 重新交换cell的位置
                    toCell: data.swapCellFrom,
                    grid: data.grid
                } as SwapStateEnterData
            );
        } else {
            // 没找到跳转到idel
            this.stateMachine.transitionTo(
                ConstStatus.getInstance().idelState,
                {} as IEnterData);
        }


    }

    onLeave(): void {

    }

    private findMatch(data: FindMatchStateEnterData) {
        const threshold = 3;
        // 检查是否可以消除
        let matches = data.grid.findMatches(threshold, (a: Cell, b: Cell) => {
            if (a.match && b.match) {
                // 重复检查
                return false;
            }
            if (a.type === CellType.INVALID) {
                return false;
            }
            // 如果是道具，则不需要匹配
            if (a.tool || b.tool) {
                return false;
            }
            // 如果类型 则可以消除
            return a.sameType(b);
        });
        return matches;
    }

    private conformCanBeMatch(data: FindMatchStateEnterData, onConfrom: () => void) {
        const randomTool = new RandomTool();
        randomTool.process(null, data.grid, () => {
            const matches = this.findMatch(data);
            if (matches.length === 0) {
                this.conformCanBeMatch(data, onConfrom);
            } else {
                onConfrom();
            }
        })
    }
}