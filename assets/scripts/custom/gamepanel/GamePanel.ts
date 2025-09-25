import { _decorator, director, instantiate, Label, Node, Prefab, randomRangeInt, UITransform, Vec3 } from 'cc';
import { LevelGridLayout } from './LevelGridLayout';
import { CellScript } from './CellScript';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { Level } from '../../game/Level';
import { ScroeRule } from '../../game/ScoreRule';
import { GoalProgress } from '../../game/goal/GoalProgress';
import { IGoalScript } from '../../game/goal/GoalTyps';
import { Constants } from '../../game/Constants';
import { Cell, CellType } from '../../game/Types';
import { GoalFactorys } from '../../game/goal/GoalFactorys';
import { ProgressScript } from './ProgressScript';
import { ScoreLabelScript } from './ScoreLabelScript';
import { EffectLineStarScript } from './EffectLineStarScript';
import { DiaLogScript } from './DiaLogScript';
import { qc } from '../../framework/qc';
import LevelMgr from '../../game/LevelMgr';
import PlayerMgr from '../../game/PlayerMgr';
import { PanelConfigs } from '../../configs/PanelConfigs';
import EventDef from '../../constants/EventDef';
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

    @property(Label)
    levelValue: Label = null;

    // 
    private levelConfig: Level = null;
    private levelData: Level = null;

    // 记录游戏状态
    private scoreValue: ScroeRule = new ScroeRule();
    private stepsValue: number = 25;
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
        this.levelConfig = option.data;
    }

    hide(option: PanelHideOption): void {
        option.onHided();
    }

    private _init() {
        if (!this.levelConfig) {
            this.levelConfig = LevelMgr.ins.getLevel(PlayerMgr.ins.player.mapId, PlayerMgr.ins.player.level);
        }

        // 初始化内容
        this.levelData = new Level(this.levelConfig);
        this.initViews(this.levelData);

        this.levelValue.string = this.levelData.levelIndex.toString();

        //监听游戏操作
        this.levelGridScript = this.levelGrid.getComponent(LevelGridLayout);
        // this.levelGridScript.init(this.levelConfig);
        this.levelGridScript.init(this.levelData);
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

                                let goalTarget = this._findGoalTarget(reduceItem.type);
                                let pos = new Vec3(0, 500, 0);
                                let moveToTargetCell = moveToTargetNode.getComponent(CellScript)
                                if (goalTarget) {
                                    let p = goalTarget.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(0, 0, 0));
                                    pos = moveToTargetCell.node.parent.getComponent(UITransform).convertToNodeSpaceAR(p);
                                }
                                moveToTargetCell.moveAndDisappear(pos, () => {

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

    start() {
        qc.eventManager.on(EventDef.Resurrection, this._resurrection, this);
        qc.eventManager.on(EventDef.UseStepsTool, this._addSteps, this);
        this._init();
    }

    protected onDestroy(): void {
        qc.eventManager.off(EventDef.Resurrection, this._resurrection, this);
        qc.eventManager.off(EventDef.UseStepsTool, this._addSteps, this);
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
                // const scoreLabelNode = instantiate(this.scoreLabelPrefab);
                // const lineStarNode = instantiate(this.lineStarPrefab);
                // this.node.addChild(scoreLabelNode);
                // // 位置暂时随机
                // scoreLabelNode.setPosition(new Vec3(
                //     randomRangeInt(-Constants.SCREEN_WIDTH / 3, Constants.SCREEN_WIDTH / 3),
                //     randomRangeInt(-Constants.SCREEN_WIDTH / 3, Constants.SCREEN_WIDTH / 3),
                //     0));
                // scoreLabelNode.getComponent(ScoreLabelScript).setValue(offset);

                // this.node.addChild(lineStarNode);
                // // TODO 位置需要计算，位置是Step相对于node里面的位置
                // lineStarNode.getComponent(EffectLineStarScript).setPath(new Vec3(-250, 500, 0), scoreLabelNode.getPosition());
                // lineStarNode.getComponent(EffectLineStarScript).startMove();

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
        // this.levelGridScript.stop();
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
        let progress = this.goalProgress.score * 100 / this.levelData.star3score;

        this.gameStatus.progressFinish = false;
        this.progressNode.getComponent(ProgressScript).setProgress(progress, () => {
            this.gameStatus.progressFinish = true;
        });

        this.updateScoreNode();
    }


    private showGameDialog(success: boolean) {
        this.dialogNode.active = true;
        let dialogScript = this.dialogNode.getComponent(DiaLogScript);
        dialogScript.setScore(this.goalProgress.score);
        dialogScript.setStarCounter(this.progressNode.getComponent(ProgressScript).getStarCountr());
        dialogScript.setSuccess(success, this.levelData);

        dialogScript.show({
            onConform: () => {
                dialogScript.remove();

                qc.panelRouter.hide({
                    panel: PanelConfigs.gamePanel,
                    onHided: () => {
                        qc.panelRouter.destroy({
                            panel: PanelConfigs.gamePanel,
                        });
                    },
                });
            }
        })
    }

    private updateGameStorage() {
        // 更新当前level的内容
        this.levelData.complete = true;
        // 如果完成的分数更低那就不用更新了
        if (this.levelData.score > this.scoreValue.score) {
            // TODO: 如果修改了计算分数的规则，需要检查
            return;
        }
        this.levelData.score = this.scoreValue.score;
        this.levelData.starCount = this.progressNode.getComponent(ProgressScript).getStarCountr();

        // 顺利过关通过分数计算是0星的话给1星//
        if (this.levelData.starCount === 0) {
            this.levelData.starCount = 1;
        }
        PlayerMgr.ins.player.stars[this.levelData.levelIndex] = this.levelData.starCount;
        qc.eventManager.emit(EventDef.Update_Stars, this.levelData.levelIndex, this.levelData.starCount);
        if (this.levelData.levelIndex >= PlayerMgr.ins.player.level) {
            let nextLevel = this.levelData.levelIndex + 1;
            let mapId = PlayerMgr.ins.player.mapId;
            if (LevelMgr.ins.getLevel(mapId, nextLevel)) {
                PlayerMgr.ins.player.level = nextLevel;
                qc.eventManager.emit(EventDef.Update_Level, true);
            }
            else {// 解锁下一张地图//
                mapId += 1;
                if (LevelMgr.ins.getMap(mapId)) {
                    PlayerMgr.ins.player.level = nextLevel;
                    PlayerMgr.ins.player.mapId = mapId;
                    qc.eventManager.emit(EventDef.Unlock_Map);
                }
            }
        }
        else {
            qc.eventManager.emit(EventDef.Jump_Level, PlayerMgr.ins.player.mapId, PlayerMgr.ins.player.level);
        }
        qc.storage.setObj(Constants.PLAYER_DATA_KEY, PlayerMgr.ins.player);
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

    public _resurrection() {
        this._addSteps(Constants.Resurrection_Add_Steps);
        this.gameStatus.gameFailed = false;
        this.gameStatus.gameSuccess = false;
        this.gameStatus.matchStableComplete = false;
        this.gameStatus.progressFinish = false;
        this.gameStatus.stepLeftReduceComplete = false;
        this.noNeedToCheckGameStatus = false;
    }

    private _addSteps(steps: number) {
        this.stepsValue += steps;
        this.updateStepNode();
    }

    onHammerClick() {
        this.levelGridScript.useHammerTool();
    }

    onSortClick() {
        this.levelGridScript.randomGrid();
    }

    onBoomClick() {
        this.levelGridScript.useBoomTool();
    }

    onAddStepsClick() {
        this.levelGridScript.useStepsTool();
    }

    private _findGoalTarget(type: CellType): Node {
        let target: Node = null;
        let goalsParent = this.goalLayoutNode.children[0];
        for (let child of goalsParent.children) {
            if (child.active) {
                let cell = child.getComponentInChildren(CellScript);
                if (type === cell.cellType) {
                    target = cell.node;
                    break;
                }
            }
        }
        return target;
    }
}