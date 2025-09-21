import { Cell } from "./Types";


const MATCH_NORMAL_CELL_SCORE = 10;
const MATCH_CONTINUE_REWARD_SCORE = 30;
const STEP_LEFT_REWARD_SCORE = 1000;
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

    public update(cells : Cell[][]) : void {
        if (cells) {
            
            // 消除得分
            {
                let newScore = 0;
                for (const cellItem of cells) {
                    newScore += (cellItem.length * MATCH_NORMAL_CELL_SCORE);
                    // 连续消除次数记录
                    this.continueMatchCounter ++;
                }
                this.score += newScore;
            }
           
            // 连续消除得分奖励
            if (this.continueMatchCounter > 0) {
                // -1 是为了去掉第一次
                let newScore = 0;
                newScore = (this.continueMatchCounter - 1) * MATCH_CONTINUE_REWARD_SCORE;
                this.score += newScore;
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