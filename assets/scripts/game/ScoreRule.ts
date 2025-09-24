import { ToolType } from "./tools/ITool";
import { Cell } from "./Types";


const MATCH_NORMAL_CELL_SCORE = 10;
const MATCH_CONTINUE_REWARD_SCORE = 30;
const STEP_LEFT_REWARD_SCORE = 100;
/**
 * 1.消除一个元素10分
 * 2.连续消除每次额外加30 * n 分，连续次数越多分数越高
 * 3.特效得分：?
 * 4.剩余步数得分：1000 * n
 */
export class ScroeRule {

    score: number = 0;

    private continueMatchCounter: number = 0;

    public init() {
        this.score = 0;
    }

    public update(cells: Cell[][]): void {
        if (cells) {
            let totalCout = 0;
            // 消除得分
            {
                let newScore = 0;
                for (const cellItem of cells) {
                    totalCout += cellItem.length;
                    let origScore = (cellItem.length * MATCH_NORMAL_CELL_SCORE);

                    newScore += origScore;
                    // 连续消除次数记录
                    this.continueMatchCounter++;

                    /**
                     * 2. 消除4个色块：+30%，例：4×10=40 分额外加30%，最终得分52
                       3. 消除5个色块：+50%；
                       4. 消除6及以上：+100%；
                     */
                    // if (cellItem.length === 4) {
                    //     newScore += newScore * .3;
                    // }
                    // else if (cellItem.length === 5) {
                    //     newScore += newScore * .5;
                    // }
                    // else if (cellItem.length >= 6) {
                    //     newScore += newScore;
                    // }

                    if (cellItem.length === 4) {
                        newScore += origScore * .3;
                    }
                    else if (cellItem.length === 5) {
                        newScore += origScore * .5;
                    }
                    else if (cellItem.length >= 6) {
                        newScore += origScore;
                    }

                    // 使用道具额外分//
                    for (let c of cellItem) {
                        if (c.tool) {
                            switch (c.tool.getType()) {
                                // 横竖清除道具：使用道具本身加20分+每个色块再额外得20%//
                                case ToolType.COL_MATCH:
                                case ToolType.ROW_MATCH:
                                    newScore += origScore * .2 + 20;
                                    break;
                                // 炸弹：使用道具本身加30分+使用炸弹消除额外得30%//
                                case ToolType.BOOM_MATCH:
                                    newScore += origScore * .3 + 30;
                                    break;
                                default:
                                    break;
                            }
                            c.tool = null;
                        }
                    }
                }
                this.score += newScore;
            }

            // 连续消除得分奖励
            if (this.continueMatchCounter > 0) {
                // // -1 是为了去掉第一次
                // let newScore = 0;
                // newScore = (this.continueMatchCounter - 1) * MATCH_CONTINUE_REWARD_SCORE;
                // this.score += newScore;

                // 2连击+5%，3连击10%，4连击15%，以此类推最高额外得50%//
                let extra = 0;
                let times = this.continueMatchCounter - 1;
                for (let i = 0; i < times; i++) {
                    extra += .05;
                }
                if (extra > .5) {
                    extra = .5;
                }
                let origScore = totalCout * MATCH_NORMAL_CELL_SCORE;
                this.score += Math.ceil(origScore * extra);
            }
        }
    }

    public updateStepsLeft(steps: number) {
        this.score += STEP_LEFT_REWARD_SCORE * steps;
    }

    // 连续消除终止信号
    public continueMatchFinish() {
        this.continueMatchCounter = 0;
    }
}