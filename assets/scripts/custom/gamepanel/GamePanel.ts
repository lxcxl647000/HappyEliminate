import { _decorator, director, instantiate, Label, Node, Prefab, randomRangeInt, Vec3 } from 'cc';
import { LevelGridLayout } from './LevelGridLayout';
import { CellScript } from './CellScript';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { LevelConfig } from '../../configs/LevelConfig';
import { ScroeRule } from '../../game/ScoreRule';
import { GoalProgress } from '../../game/goal/GoalProgress';
import { IGoalScript } from '../../game/goal/GoalTyps';
import { Constants } from '../../game/Constants';
import { Cell, CellType } from '../../game/Types';
import { GoalFactorys } from '../../game/goal/GoalFactorys';
import { ProgressScript } from './ProgressScript';
import { EffectLineStarScript } from './EffectLineStarScript';
import { DiaLogScript } from './DiaLogScript';
import { qc } from '../../framework/qc';
import LevelMgr from '../../manager/LevelMgr';
import PlayerMgr from '../../manager/PlayerMgr';
import { PanelConfigs } from '../../configs/PanelConfigs';
import EventDef from '../../constants/EventDef';
import CocosUtils from '../../utils/CocosUtils';
import { ITool, ToolType } from '../../game/tools/ITool';
import MathUtils from '../../utils/MathUtils';
import { ConstStatus } from '../../game/gridstate/ConstStatus';
import { ToolsStateEnterData } from '../../game/gridstate/ToolsState';
import { BoomMatchTool } from '../../game/tools/BoomMatchTool';
import { ColMatchTool } from '../../game/tools/ColMatchTool';
import { RowMatchTool } from '../../game/tools/RowMatchTool';
import { ItemType } from '../../configs/ItemConfig';
import { GameSelectToolBtn } from './GameSelectToolBtn';
import { GameExchangeTool } from './GameExchangeTool';
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

    @property(Node)
    toolMask: Node = null;
    @property(Node)
    toolsCopy: Node = null;
    @property(Node)
    toolTitle: Node = null;

    @property(Node)
    selectToolFrom: Node = null;
    @property(GameExchangeTool)
    exchangeTool: GameExchangeTool = null;

    // 
    private levelConfig: LevelConfig = null;
    private levelData: LevelConfig = null;

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
    public getIsFirstStableHappened() { return this.isFirstStableHappened; }

    private _isFinish: boolean = false;
    public get isFinish() { return this._isFinish; }

    // 游戏状态，用来判断游戏是否结束
    private gameStatus: GameStaus = new GameStaus();

    // 剩余步数转换成道具需要的道具//
    private _needRandomTools: ToolType[] = [ToolType.BOOM_MATCH, ToolType.ROW_MATCH, ToolType.COL_MATCH];

    // 当前选中底部使用的道具类型//
    private _useToolType: ToolType = ToolType.INVALID;
    public get useToolType() { return this._useToolType; }

    private _seletToolFromGameStart: { [id: number]: number } = {};

    private _selectTools: ToolType[] = [ToolType.TYPE_HAMMER, ToolType.RANDOM_GRID, ToolType.TYPE_BOOM, ToolType.TYPE_STEPS];


    show(option: PanelShowOption): void {
        option.onShowed();
        let { level, selectTools } = option.data;
        this.levelConfig = level as LevelConfig;
        this._seletToolFromGameStart = selectTools as { [id: number]: number };
    }

    hide(option: PanelHideOption): void {
        option.onHided();
    }

    private _init() {
        if (!this.levelConfig) {
            this.levelConfig = LevelMgr.ins.getLevel(PlayerMgr.ins.player.mapId, PlayerMgr.ins.player.level);
        }

        this._initTools();

        // 初始化内容
        this.levelData = new LevelConfig(this.levelConfig);
        this.initViews(this.levelData);

        this.levelValue.string = this.levelData.levelIndex.toString();

        //监听游戏操作
        this.levelGridScript = this.levelGrid.getComponent(LevelGridLayout);
        this.levelGridScript.setGamePanel(this);
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
                                    pos = CocosUtils.setNodeToTargetPos(moveToTargetCell.node, goalTarget);
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
                let func = () => {
                    if (!this.isFirstStableHappened) {
                        this.isFirstStableHappened = true;
                    }

                    // 停止连续消除计分
                    this.scoreValue.continueMatchFinish();

                    // 检查游戏是否结束
                    if (this.levelGoal.isComplete()) {
                        this._isFinish = true;
                        this.processLeftSteps(() => {
                            this.gameStatus.gameSuccess = true;
                        });
                    } else if (this.stepsValue <= 0) {
                        this._isFinish = true;
                        this.gameStatus.gameFailed = true;
                        this.processLeftSteps();
                    }

                    this.gameStatus.matchStableComplete = true;
                };

                if (!this.isFirstStableHappened) {
                    this._setToolFormGameStart(() => {
                        func();
                    });
                }
                else {
                    func();
                }
            }
        });
    }

    start() {
        qc.eventManager.on(EventDef.Resurrection, this._resurrection, this);
        qc.eventManager.on(EventDef.UseStepsTool, this._addSteps, this);
        qc.eventManager.on(EventDef.Game_Select_Tool, this._useTool, this);
        this._init();
    }

    protected onDestroy(): void {
        qc.eventManager.off(EventDef.Resurrection, this._resurrection, this);
        qc.eventManager.off(EventDef.UseStepsTool, this._addSteps, this);
        qc.eventManager.off(EventDef.Game_Select_Tool, this._useTool, this);
    }

    private noNeedToCheckGameStatus: boolean = false;
    update(deltaTime: number) {
        if (this.noNeedToCheckGameStatus) {
            return;
        }
        this.noNeedToCheckGameStatus = this.checkGameStatus();
    }

    private initViews(levelConfig: LevelConfig) {

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
    private initGoalAndProgressViews(levelConfig: LevelConfig) {
        let { goalScript } = GoalFactorys.appendGoalNode(levelConfig.goal, this.goalPrefabs, this.goalLayoutNode);
        this.levelGoal = goalScript;
        this.goalProgress = this.levelGoal.getGoal();

        // 三星进度
        this.progressNode.getComponent(ProgressScript).setProgress(0);
    }

    private processLeftSteps(cb?: Function) {
        // 处理步数
        // 将剩余的步数转化成分数, 动画递减
        this.gameStatus.stepLeftReduceComplete = false;
        if (this.stepsValue > 0) {
            const intervalTime = Constants.PROGRESS_CHANGE_DURATION;
            const repeatCount = this.stepsValue;

            let randomCells = [];

            this.schedule(() => {
                console.log('process left step', this.stepsValue)
                if (this.stepsValue === 0) {
                    return;
                } else {
                    this.stepsValue--;
                }
                this.scoreValue.updateStepsLeft(1);
                this.updateScoreAndProgress();
                this.updateStepNode();

                const lineStarNode = instantiate(this.lineStarPrefab);
                this.node.addChild(lineStarNode);
                let randomCell = this.levelGridScript.grid.randomCell();
                let fromPos = CocosUtils.setNodeToTargetPos(lineStarNode, this.stepsValueNode);
                let toPos = CocosUtils.setNodeToTargetPos(lineStarNode, randomCell.node);
                let effectLineStarScript = lineStarNode.getComponent(EffectLineStarScript);
                effectLineStarScript.setDuration(.4);
                effectLineStarScript.setPath(fromPos, toPos);
                effectLineStarScript.startMove(() => {
                    let type = MathUtils.randomSort(this._needRandomTools)[0];
                    let iTool: ITool = null;
                    switch (type) {
                        case ToolType.BOOM_MATCH:
                            iTool = new BoomMatchTool();
                            break;
                        case ToolType.COL_MATCH:
                            iTool = new ColMatchTool();
                            break;
                        case ToolType.ROW_MATCH:
                            iTool = new RowMatchTool();
                            break;
                    }
                    if (!randomCell.node) {
                        ConstStatus.getInstance().fillState.fillWithTool(randomCell, iTool);
                    }
                    else {
                        let cellScript = randomCell.node.getComponent(CellScript);
                        if (cellScript) {
                            cellScript.setToolType(type);
                            ConstStatus.getInstance().fillState.setWithTool(randomCell, iTool);
                        }
                    }
                    randomCells.push(randomCell);
                    if (randomCells.length === repeatCount) {
                        this.scheduleOnce(() => {
                            for (let i = 0; i < randomCells.length; i++) {
                                let cell = randomCells[i];
                                this.levelGridScript.getGridStateMachine().transitionTo(
                                    ConstStatus.getInstance().toolsState,
                                    {
                                        cell: cell,
                                        tool: cell.tool,
                                        grid: this.levelGridScript.grid
                                    } as ToolsStateEnterData
                                );
                            }
                        }, .5);
                    }
                });
            }, intervalTime, repeatCount);
        } else {
            this.gameStatus.stepLeftReduceComplete = true;
            cb && cb();
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
        if (success) {
            dialogScript.setRewards(this.levelData.rewards, Math.random() > .5 ? true : false);
        }

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
        this._isFinish = false;
    }

    private _addSteps(steps: number) {
        this.stepsValue += steps;
        this.updateStepNode();
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

    onToolMaskClick() {
        this.hideToolMask();
    }

    public showToolMask(type: ToolType) {
        this._useToolType = type;
        this.toolMask.active = true;
        this.toolTitle.getChildByName('des').getComponent(Label).string = type === ToolType.TYPE_HAMMER ? '点击任意一格敲碎障碍' : '点击任意地方可大范围消除';
        this.toolTitle.active = true;
        this.toolsCopy.getChildByName(ToolType[type]).active = true;
    }

    public hideToolMask() {
        this._useToolType = ToolType.INVALID;
        this.toolMask.active = false;
        this.toolTitle.active = false;
        for (let child of this.toolsCopy.children) {
            child.active = false;
        }
    }

    private _setToolFormGameStart(cb: Function) {
        let tools = [];
        for (let key in this._seletToolFromGameStart) {
            if (this._seletToolFromGameStart[key] > 0) {
                tools.push(key);
            }
        }
        let count = tools.length;
        if (count > 0) {
            for (let tool of tools) {
                const lineStarNode = instantiate(this.lineStarPrefab);
                this.node.addChild(lineStarNode);
                let randomCell = +tool === ToolType.TYPE_STEPS ? null : this.levelGridScript.grid.randomCell();
                let fromPos = CocosUtils.setNodeToTargetPos(lineStarNode, this.selectToolFrom);
                let toPos = CocosUtils.setNodeToTargetPos(lineStarNode, randomCell ? randomCell.node : this.stepsValueNode);
                let effectLineStarScript = lineStarNode.getComponent(EffectLineStarScript);
                effectLineStarScript.setDuration(.4);
                effectLineStarScript.setPath(fromPos, toPos);
                effectLineStarScript.startMove(() => {
                    if (randomCell) {
                        let iTool: ITool = new BoomMatchTool();
                        if (!randomCell.node) {
                            ConstStatus.getInstance().fillState.fillWithTool(randomCell, iTool);
                        }
                        else {
                            let cellScript: CellScript = randomCell.node.getComponent(CellScript);
                            if (cellScript) {
                                cellScript.setToolType(+tool);
                                ConstStatus.getInstance().fillState.setWithTool(randomCell, iTool);
                            }
                        }
                        if (--count === 0) {
                            cb && cb();
                        }
                    }
                    else {
                        this._addSteps(Constants.Tool_Add_Steps);
                        if (--count === 0) {
                            cb && cb();
                        }
                    }
                    let itemType = +tool === ToolType.TYPE_STEPS ? ItemType.Steps : ItemType.Boom;
                    PlayerMgr.ins.addItem(itemType, -1, true);
                });
            }
        }
        else {
            cb && cb();
        }
    }

    private _useTool(type: ToolType) {
        switch (type) {
            case ToolType.TYPE_HAMMER:
            case ToolType.TYPE_BOOM:
                this.showToolMask(type);
                break;
            case ToolType.TYPE_STEPS:
                this.levelGridScript.useStepsTool();
                qc.eventManager.emit(EventDef.Game_Select_Tool_Success, type);
                break;
            case ToolType.RANDOM_GRID:
                this.levelGridScript.randomGrid();
                qc.eventManager.emit(EventDef.Game_Select_Tool_Success, type);
                break;
        }
    }

    private _initTools() {
        for (let i = 0; i < this._selectTools.length; i++) {
            let toolBtn = this.tools.children[i].getComponent(GameSelectToolBtn);
            if (toolBtn) {
                toolBtn.init(this._selectTools[i], this, this.exchangeTool);
            }
        }
    }
}