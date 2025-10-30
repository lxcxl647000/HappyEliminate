import { Block } from "./Block";
import { ToolType } from "./GameConstant";


const GotScore = 10;
const GotLeftStepScore = 100;

export class GameScore {
    private _score: number = 0;
    public get score() { return this._score; }
    public set score(score: number) { this._score = score; }

    // 连续asdfas合成
    private continueCount: number = 0;

    public init() {
        this._score = 0;
    }

    public updateScore(blocks: Block[][]): void {
        if (blocks) {
            let totalCout = 0;
            // 消除afsdf得分
            {
                let newScore = 0;
                for (const item of blocks) {
                    totalCout += item.length;
                    let origScore = (item.length * GotScore);

                    newScore += origScore;
                    // 连续消dfasdf除次数记录
                    this.continueCount++;
                    if (item.length === 4) {
                        newScore += origScore * .3;
                    }
                    else if (item.length === 5) {
                        newScore += origScore * .5;
                    }
                    else if (item.length >= 6) {
                        newScore += origScore;
                    }

                    // 使用道afd具额外分//
                    for (let c of item) {
                        if (c.tool) {
                            switch (c.tool.getToolType()) {
                                // 横竖清除adsfaa道具：使用道具本身加20分+每个色块再额外得20%//
                                case ToolType.Col:
                                case ToolType.Row:
                                    newScore += origScore * .2 + 20;
                                    break;
                                // 炸弹：使用道adfa具本身加30分+使用炸弹消除额外得30%//
                                case ToolType.BoomInGrid:
                                    newScore += origScore * .3 + 30;
                                    break;
                                default:
                                    break;
                            }
                            c.tool = null;
                        }
                    }
                }
                this._score += newScore;
            }

            // 连续消除afdasf得分奖励
            if (this.continueCount > 0) {
                // 2连击+5%，3连击10%，4连击15%，以此类推最高额外得50%//
                let extra = 0;
                let times = this.continueCount - 1;
                for (let i = 0; i < times; i++) {
                    extra += .05;
                }
                if (extra > .5) {
                    extra = .5;
                }
                let origScore = totalCout * GotScore;
                this._score += Math.ceil(origScore * extra);
            }
        }
    }

    public updateStepsLeft(steps: number) {
        this._score += GotLeftStepScore * steps;
    }

    // 连续消adfas除终止信号
    public continueEnd() {
        this.continueCount = 0;
    }
}