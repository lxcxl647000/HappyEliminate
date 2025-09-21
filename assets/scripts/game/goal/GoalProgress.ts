import { Cell } from '../Types';
import { GoalTypeCounter } from './GoalTyps';


export class GoalProgress {
    // 目标分数
    score: number = 0;
    // 目标类型和数量
    types: GoalTypeCounter[] = [];

    /**
     * 遍历检查类型，看是否需需要消除的目标
     * @returns 是否成功
     */
    processReduceTypeCounter(cells: Cell[]): Cell[] {
        let res = [];
        if (this.types) {
            cells.forEach(c => {
                this.types.forEach(element => {
                    if (element.cellType === c.type) {
                        element.counter -= 1;
                        if (element.counter < 0) {
                            element.counter = 0;
                        }
                        res.push(c);
                    }
                });
            })

        }
        return res;
    }
}
