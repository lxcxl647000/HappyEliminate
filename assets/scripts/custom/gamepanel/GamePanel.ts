import { _decorator, Component, director, instantiate, Label, Node, Prefab, randomRangeInt, Vec3 } from 'cc';
import { LevelGridLayout } from './LevelGridLayout';
import { CellScript } from './CellScript';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { Level } from '../../game/Level';
import { ScroeRule } from '../../game/ScoreRule';
import { GoalProgress } from '../../game/goal/GoalProgress';
import { IGoalScript } from '../../game/goal/GoalTyps';
import { Constants } from '../../game/Constants';
import { Cell } from '../../game/Types';
import { GoalFactorys } from '../../game/goal/GoalFactorys';
import { ProgressScript } from './ProgressScript';
import { ScoreLabelScript } from './ScoreLabelScript';
import { EffectLineStarScript } from './EffectLineStarScript';
import { DiaLogScript } from './DiaLogScript';
import { qc } from '../../framework/qc';
import { GlobalData } from '../../game/util/GlobalData';
import LevelMgr from '../../game/LevelMgr';
const { ccclass, property } = _decorator;

class GameStaus {
    progressFinish: boolean = false;
    stepLeftReduceComplete: boolean = false;
    matchStableComplete: boolean = false;

    gameSuccess: boolean = false;
    gameFailed: boolean = false;
}

/**
 * 控制整个游戏
 */
@ccclass('GamePanel')
export class GamePanel extends PanelComponent {

    @property(Node)
    goalLayoutNode: Node

    @property([Prefab])
    goalPrefabs: Prefab[] = new Array<Prefab>();

    @property(Node)
    progressNode: Node

    @property(Node)
    stepsValueNode: Node

    @property(Node)
    levelGrid: Node

    @property(Node)
    tools: Node

    @property(Node)
    scoreValueNode: Node

    // 成功或者失败的弹窗
    @property(Node)
    dialogNode: Node;

    // 消除分数的Label显示
    @property(Prefab)
    scoreLabelPrefab: Prefab;
    @property(Prefab)
    lineStarPrefab: Prefab;

    // 
    private levelConfig: Level = new Level();

    // 记录游戏状态
    private scoreValue: ScroeRule = new ScroeRule();
    private stepsValue: number = 20;
    private goalProgress: GoalProgress = new GoalProgress();

    // 游戏操作
    private levelGridScript: LevelGridLayout;

    // 游戏目标
    private levelGoal: IGoalScript;

    // 第一次下落消除的不计分
    private isFirstStableHappened: boolean = false;

    // 游戏状态，用来判断游戏是否结束
    private gameStatus: GameStaus = new GameStaus();

    show(option: PanelShowOption): void {
        option.onShowed();
    }

    hide(option: PanelHideOption): void {
        option.onHided();
    }

    start() {
        // 从全局变量中获取
        this.levelConfig = LevelMgr.ins.levels[0];
        // 初始化内容
        this.initViews(this.levelConfig);

        //监听游戏操作
        this.levelGridScript = this.levelGrid.getComponent(LevelGridLayout);
        this.levelGridScript.init(this.levelConfig);
        this.levelGridScript.setGridListener({
            onSwapStep: (from: Cell, to: Cell) => {
                if (!this.isFirstStableHappened) {
                    return;
                }
                this.stepsValue--;
                this.updateStepNode();
                this.updateGoalNode();
            },
            onMatch: (cells: Cell[][]) => {
                if (!this.isFirstStableHappened) {
                    return;
                }

                // 消除的时候计分
                this.scoreValue.update(cells);

                // 计算消除个数
                if (cells) {
                    for (const cellItems of cells) {
                        const reduceSuccessCells = this.goalProgress.processReduceTypeCounter(cellItems);
                        if (reduceSuccessCells.length > 0) {
                            // 增加一个动画将元素 移动到target
                            for (const reduceItem of reduceSuccessCells) {
                                const moveToTargetNode = instantiate(reduceItem.node);
                                this.levelGrid.addChild(moveToTargetNode);
                                // TODO 位置需要计算，位置是每个Target相对于levelGrid的位置
                                moveToTargetNode.getComponent(CellScript).moveAndDisappear(new Vec3(0, 500, 0), () => {

                                    this.updateScoreAndProgress()
                                    this.updateGoalNode();
                                    this.gameStatus.matchStableComplete = false;
                                });
                            }
                        }
                    }
                }


            },
            onStable: () => {
                if (!this.isFirstStableHappened) {
                    this.isFirstStableHappened = true;
                }

                // 停止连续消除计分
                this.scoreValue.continueMatchFinish();

                // 检查游戏是否结束
                if (this.levelGoal.isComplete()) {
                    this.gameStatus.gameSuccess = true;
                    this.processLeftSteps();
                } else if (this.stepsValue <= 0) {
                    this.gameStatus.gameFailed = true;
                    this.processLeftSteps();
                }

                this.gameStatus.matchStableComplete = true;
            }
        });

    }
    private noNeedToCheckGameStatus: boolean = false;
    update(deltaTime: number) {
        if (this.noNeedToCheckGameStatus) {
            return;
        }
        this.noNeedToCheckGameStatus = this.checkGameStatus();
    }

    private initViews(levelConfig: Level) {

        this.stepsValue = levelConfig.steps;
        this.scoreValue.init();

        // 根据类型显示目标
        this.initGoalAndProgressViews(levelConfig);

        this.updateStepNode();
        this.updateScoreNode();

        // 隐藏游戏结束弹窗
        this.dialogNode.active = false;
    }

    /**
     * 根据关卡的目标，生成不同的目标Node
     * @param levelConfig 
     */
    private initGoalAndProgressViews(levelConfig: Level) {
        let { goalScript } = GoalFactorys.appendGoalNode(levelConfig.goal, this.goalPrefabs, this.goalLayoutNode);
        this.levelGoal = goalScript;
        this.goalProgress = this.levelGoal.getGoal();

        // 三星进度
        this.progressNode.getComponent(ProgressScript).setProgress(0);
    }

    private processLeftSteps() {
        // 处理步数
        // 将剩余的步数转化成分数, 动画递减
        this.gameStatus.stepLeftReduceComplete = false;
        if (this.stepsValue > 0) {
            const intervalTime = Constants.PROGRESS_CHANGE_DURATION;
            const repeatCount = this.stepsValue;
            this.schedule(() => {
                const lastValue = this.scoreValue.score;
                this.scoreValue.updateStepsLeft(1);
                this.updateScoreAndProgress();
                this.updateStepNode();

                // 将分数显示出来
                const offset = this.scoreValue.score - lastValue;
                const scoreLabelNode = instantiate(this.scoreLabelPrefab);
                const lineStarNode = instantiate(this.lineStarPrefab);
                this.node.addChild(scoreLabelNode);
                // 位置暂时随机
                scoreLabelNode.setPosition(new Vec3(
                    randomRangeInt(-Constants.SCREEN_WIDTH / 3, Constants.SCREEN_WIDTH / 3),
                    randomRangeInt(-Constants.SCREEN_WIDTH / 3, Constants.SCREEN_WIDTH / 3),
                    0));
                scoreLabelNode.getComponent(ScoreLabelScript).setValue(offset);

                this.node.addChild(lineStarNode);
                // TODO 位置需要计算，位置是Step相对于node里面的位置
                lineStarNode.getComponent(EffectLineStarScript).setPath(new Vec3(-250, 500, 0), scoreLabelNode.getPosition());
                lineStarNode.getComponent(EffectLineStarScript).startMove();

                console.log('process left step', this.stepsValue)
                if (this.stepsValue === 0) {
                    this.gameStatus.stepLeftReduceComplete = true;
                } else {
                    this.stepsValue--;
                }
            }, intervalTime, repeatCount)
        } else {
            this.gameStatus.stepLeftReduceComplete = true;
        }
    }

    private checkGameStatus(): boolean {
        if (this.gameStatus.matchStableComplete &&
            this.gameStatus.progressFinish &&
            this.gameStatus.stepLeftReduceComplete) {
            if (this.gameStatus.gameSuccess) {
                this.gamePass();
                return true;
            }

            if (this.gameStatus.gameFailed) {
                this.gameOver();
                return true;
            }
        }
        return false;

    }

    private gameOver() {
        console.log("game over");
        this.levelGridScript.stop();
        // 显示游戏结束弹窗
        this.showGameDialog(false);
    }

    private gamePass() {
        console.log("game pass");
        this.levelGridScript.stop();

        // 显示游戏结束弹窗
        this.showGameDialog(true);

        // 更新游戏进度
        this.updateGameStorage();
    }

    // 更新分数和进度
    private updateScoreAndProgress() {
        this.goalProgress.score = this.scoreValue.score;
        // 计算3星进度
        // 三星进度, 乘上100，是为了计算百分比
        let progress = this.goalProgress.score * 100 / this.levelConfig.star3score;

        this.gameStatus.progressFinish = false;
        this.progressNode.getComponent(ProgressScript).setProgress(progress, () => {
            this.gameStatus.progressFinish = true;
        });

        this.updateScoreNode();
    }


    private showGameDialog(success: boolean) {
        this.dialogNode.active = true;
        let dialogScript = this.dialogNode.getComponent(DiaLogScript);
        dialogScript.setTitle("LEVEL " + this.levelConfig.levelIndex);
        dialogScript.setScore(this.goalProgress.score);
        dialogScript.setStarCounter(this.progressNode.getComponent(ProgressScript).getStarCountr());
        dialogScript.setSuccess(success);

        dialogScript.show({
            onConform: () => {
                dialogScript.remove();
                director.loadScene("menu");
            }
        })
    }

    private updateGameStorage() {
        // 更新当前level的内容
        this.levelConfig.complete = true;
        // 如果完成的分数更低那就不用更新了
        if (this.levelConfig.score > this.scoreValue.score) {
            // TODO: 如果修改了计算分数的规则，需要检查
            return;
        }
        this.levelConfig.score = this.scoreValue.score;
        this.levelConfig.starCount = this.progressNode.getComponent(ProgressScript).getStarCountr();

        // 更新列表中的内容
        let levels = GlobalData.getInstance().getDataStr(Constants.LEVEL_DATA_KEY) as Level[]
        for (let index = 0; index < levels.length; index++) {
            const element = levels[index];
            if (element.levelIndex === this.levelConfig.levelIndex) {
                levels[index] = this.levelConfig;
                break;
            }
        }
        GlobalData.getInstance().setDataStr(Constants.LEVEL_DATA_KEY, levels);
        qc.storage.setObj(Constants.LEVEL_DATA_PATH, levels);
    }

    private updateStepNode() {
        this.stepsValueNode.getComponent(Label).string = JSON.stringify(this.stepsValue);
    }
    private updateScoreNode() {
        this.scoreValueNode.getComponent(Label).string = JSON.stringify(this.scoreValue.score);
    }
    private updateGoalNode() {
        this.levelGoal.updateGoal(this.goalProgress);
    }
}