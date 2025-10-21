import { _decorator, instantiate, Label, log, Node, Prefab, Sprite, Tween, tween, UITransform, Vec2, Vec3, Widget } from 'cc';
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
import LevelMgr, { PassData, PassReward } from '../../manager/LevelMgr';
import PlayerMgr, { Currentlevel } from '../../manager/PlayerMgr';
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
import ItemMgr, { IItem } from '../../manager/ItemMgr';
import { musicMgr } from '../../manager/musicMgr';
import CustomSprite from '../componetUtils/CustomSprite';
import { SettingMgr } from '../../manager/SettingMgr';
import GuideMgr, { GuideType } from '../../manager/GuideMgr';
import { GameShowTarget } from './GameShowTarget';
import { BundleConfigs } from '../../configs/BundleConfigs';
import { IdelState } from '../../game/gridstate/IdelState';
import CommonTipsMgr from '../../manager/CommonTipsMgr';
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

    @property(Node)
    settingNode: Node = null;
    @property(Node)
    settingMask: Node = null;
    @property(CustomSprite)
    soundSprite: CustomSprite = null;
    @property(CustomSprite)
    musicSprite: CustomSprite = null;
    @property(CustomSprite)
    vibrateSprite: CustomSprite = null;
    @property(GameShowTarget)
    gameShowTarget: GameShowTarget = null;
    @property(Sprite)
    bgSprite: Sprite = null;

    private levelConfig: LevelConfig = null;
    public levelData: LevelConfig = null;

    // 记录游戏状态
    private scoreValue: ScroeRule = new ScroeRule();
    private stepsValue: number = 25;
    private goalProgress: GoalProgress = new GoalProgress();

    // 游戏操作
    private levelGridScript: LevelGridLayout;
    public getLevelGridScript() { return this.levelGridScript; }

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

    private _musicCD: number = 0;
    private _soundCD: number = 0;
    private _vibrateCD: number = 0;

    show(option: PanelShowOption): void {
        option.onShowed();
        let { level, selectTools } = option.data;
        this.levelConfig = level as LevelConfig;
        this._seletToolFromGameStart = selectTools as { [id: number]: number };
        this._updateTheme(PlayerMgr.ins.userInfo.summary.current_theme_id);
    }

    hide(option: PanelHideOption): void {
        option.onHided();
    }

    private _init(isReplay: boolean = false) {
        if (!this.levelConfig) {
            this.levelConfig = LevelMgr.ins.getLevel(PlayerMgr.ins.userInfo.summary.map_on, PlayerMgr.ins.userInfo.summary.latest_passed_level + 1);
        }
        this._initTools();

        // 初始化内容
        this.levelData = new LevelConfig(this.levelConfig);
        this.initViews(this.levelData, isReplay);

        this.levelValue.string = this.levelData.levelIndex.toString();

        //监听游戏操作
        this.levelGridScript = this.levelGrid.getComponent(LevelGridLayout);
        this.levelGridScript.setGamePanel(this);
        this.levelGridScript.init(this.levelData, isReplay);

        if (!isReplay) {
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

                            this._showGameTarget();
                        }
                        else {
                            if (GuideMgr.ins.checkGuide(GuideType.Force_Level_2_Use_ColMatch) && this.levelData.levelIndex === 2) {
                                this._useColMatch();
                                qc.eventManager.emit(EventDef.HideGuide, GuideType.Force_Level_2_Eliminate);
                            }
                            if (GuideMgr.ins.checkGuide(GuideType.Force_Level_3_Use_Boom) && this.levelData.levelIndex === 3) {
                                this._useBoomMatch();
                            }
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
                        this._setToolFromGameStart(() => {
                            func();
                        });
                    }
                    else {
                        func();
                    }
                }
            });
        } else {
            this.levelGridScript.initConstStatus();
        }
    }

    start() {
        qc.eventManager.on(EventDef.Resurrection, this._resurrection, this);
        qc.eventManager.on(EventDef.UseStepsTool, this._addSteps, this);
        qc.eventManager.on(EventDef.Game_Select_Tool, this._useTool, this);
        qc.eventManager.on(EventDef.UpdateSoundStatus, this._updateSoundStatus, this);
        qc.eventManager.on(EventDef.UpdateMusicStatus, this._updateMusicStatus, this);
        qc.eventManager.on(EventDef.UpdateVibrateStatus, this._updateVibrateStatus, this);
        qc.eventManager.on(EventDef.SelectBoomGuide, this._selectBoomGuide, this);
        qc.eventManager.on(EventDef.PassTargetGuide, this._passTargetGuide, this);
        qc.eventManager.on(EventDef.Update_Theme, this._updateTheme, this);
        qc.eventManager.on(EventDef.OnShow, this._onshow, this);
        this._init();
        this._updateSoundStatus();
        this._updateMusicStatus();
        this._updateVibrateStatus();
    }

    protected onDestroy(): void {
        qc.eventManager.off(EventDef.Resurrection, this._resurrection, this);
        qc.eventManager.off(EventDef.UseStepsTool, this._addSteps, this);
        qc.eventManager.off(EventDef.Game_Select_Tool, this._useTool, this);
        qc.eventManager.off(EventDef.UpdateSoundStatus, this._updateSoundStatus, this);
        qc.eventManager.off(EventDef.UpdateMusicStatus, this._updateMusicStatus, this);
        qc.eventManager.off(EventDef.UpdateVibrateStatus, this._updateVibrateStatus, this);
        qc.eventManager.off(EventDef.SelectBoomGuide, this._selectBoomGuide, this);
        qc.eventManager.off(EventDef.PassTargetGuide, this._passTargetGuide, this);
        qc.eventManager.off(EventDef.Update_Theme, this._updateTheme, this);
        qc.eventManager.off(EventDef.OnShow, this._onshow, this);
    }

    private noNeedToCheckGameStatus: boolean = false;
    update(dt: number) {
        if (this._musicCD > 0) {
            this._musicCD -= dt;
            if (this._musicCD < 0) {
                this._musicCD = 0;
            }
        }
        if (this._soundCD > 0) {
            this._soundCD -= dt;
            if (this._soundCD < 0) {
                this._soundCD = 0;
            }
        }
        if (this._vibrateCD > 0) {
            this._vibrateCD -= dt;
            if (this._vibrateCD < 0) {
                this._vibrateCD = 0;
            }
        }
        if (this.noNeedToCheckGameStatus) {
            return;
        }
        this.noNeedToCheckGameStatus = this.checkGameStatus();
    }

    private initViews(levelConfig: LevelConfig, isReplay: boolean) {

        this.stepsValue = levelConfig.steps;
        this.scoreValue.init();

        // 根据类型显示目标
        this.initGoalAndProgressViews(levelConfig, isReplay);

        this.updateStepNode();
        this.updateScoreNode();

        // 隐藏游戏结束弹窗
        this.dialogNode.active = false;
    }

    /**
     * 根据关卡的目标，生成不同的目标Node
     * @param levelConfig 
     */
    private initGoalAndProgressViews(levelConfig: LevelConfig, isReplay: boolean) {
        let { goalScript } = GoalFactorys.appendGoalNode(levelConfig.goal, this.goalPrefabs, this.goalLayoutNode, isReplay);
        this.levelGoal = goalScript;
        this.goalProgress = this.levelGoal.getGoal();

        // 三星进度
        this.progressNode.getComponent(ProgressScript).setProgress(0);
    }

    private processLeftSteps(cb?: Function) {
        // 处理步数
        // 将剩余的步数转化成分数, 动画递减
        this.gameStatus.stepLeftReduceComplete = false;
        let lineArr: Node[] = [];
        let randomCells: Cell[] = [];

        if (this.stepsValue > 0) {
            const intervalTime = Constants.PROGRESS_CHANGE_DURATION * 1000;
            const repeatCount = this.stepsValue;

            for (let i = 0; i < repeatCount; i++) {
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
                randomCells.push(randomCell);

                let fromPos = CocosUtils.setNodeToTargetPos(lineStarNode, this.stepsValueNode);
                let toPos = CocosUtils.setNodeToTargetPos(lineStarNode, randomCell.node);
                let effectLineStarScript = lineStarNode.getComponent(EffectLineStarScript);
                effectLineStarScript.setDuration(.4);
                effectLineStarScript.setPath(fromPos, toPos);
                lineStarNode.setPosition(fromPos);
                lineStarNode.active = false;
                lineArr.push(lineStarNode);
            }

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
            }, Constants.PROGRESS_CHANGE_DURATION * randomCells.length + .5);

            let index = 0;
            for (let i = 0; i < randomCells.length; i++) {
                let line = lineArr[i];
                let effectLineStarScript = line.getComponent(EffectLineStarScript);
                setTimeout(() => {
                    if (index >= randomCells.length) {
                        return;
                    }
                    effectLineStarScript.node.active = true;
                    effectLineStarScript.startMove(randomCells[index], (cell: Cell) => {
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
                        if (!cell.node) {
                            ConstStatus.getInstance().fillState.fillWithTool(cell, iTool);
                        }
                        else {
                            let cellScript = cell.node.getComponent(CellScript);
                            if (cellScript) {
                                cellScript.setToolType(type);
                                ConstStatus.getInstance().fillState.setWithTool(cell, iTool);
                            }
                        }
                    });
                    index++;
                }, intervalTime * i);
            }
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

        // 更新游戏进度
        this.updateGameStorage();

        // 新手引导第一关特殊处理 在结算时才发送使用道具给服务器，避免玩家在游戏中就把道具使用了，但未完成引导，再次触发引导时没有道具可用
        if (this.levelData.levelIndex === 1 && PlayerMgr.ins.userInfo.current_level.length === 0) {
            let item: IItem = ItemMgr.ins.getItem(ItemType.Hammer);
            if (item) {
                ItemMgr.ins.useItem(item.type, this.levelData.levelIndex, null);
            }
            item = ItemMgr.ins.getItem(ItemType.Boom);
            if (item) {
                ItemMgr.ins.useItem(item.type, this.levelData.levelIndex, null);
            }
        }

        LevelMgr.ins.sendLevelPassToServer(this.levelData.levelIndex,
            this.progressNode.getComponent(ProgressScript).getStarCountr(),
            this.scoreValue.score,
            PlayerMgr.ins.userInfo.summary.map_on,
            (data: PassData) => {
                // 显示游戏结束弹窗
                qc.platform.reportScene(401);
                this.showGameDialog(true, data.rewards);
            });
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


    private showGameDialog(success: boolean, rewards?: PassReward[]) {
        this.dialogNode.active = true;
        let dialogScript = this.dialogNode.getComponent(DiaLogScript);
        dialogScript.setScore(this.goalProgress.score);
        dialogScript.setStarCounter(this.progressNode.getComponent(ProgressScript).getStarCountr());
        dialogScript.setSuccess(success, this.levelData);
        if (success) {
            dialogScript.setRewards(rewards);
        }

        dialogScript.show({
            onConform: () => {
                dialogScript.remove();
                this._backToMainPanel();
            }
        })
    }

    private _backToMainPanel() {
        qc.panelRouter.hide({
            panel: PanelConfigs.gamePanel,
            onHided: () => {
                qc.eventManager.emit(EventDef.GamePanelToMainPanel);
                qc.panelRouter.destroy({
                    panel: PanelConfigs.gamePanel,
                });
            },
        });
        musicMgr.ins.playMusic('bg_music');
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

        let levelInfo: Currentlevel = {
            level_no: this.levelData.levelIndex,
            best_score: this.scoreValue.score,
            best_stars: this.levelData.starCount,
            play_times: 0,
            pass_status: '',
            create_time: '',
            update_time: ''
        };
        PlayerMgr.ins.setLevelInfo(levelInfo);
        PlayerMgr.ins.userInfo.summary.total_stars += this.levelData.starCount;
        PlayerMgr.ins.userInfo.summary.total_score += this.scoreValue.score;
        qc.eventManager.emit(EventDef.Update_Stars, this.levelData.levelIndex, this.levelData.starCount);
        if (this.levelData.levelIndex > PlayerMgr.ins.userInfo.summary.latest_passed_level) {
            let nextLevel = this.levelData.levelIndex + 1;
            let mapId = PlayerMgr.ins.userInfo.summary.map_on;
            if (LevelMgr.ins.getLevel(mapId, nextLevel)) {
                PlayerMgr.ins.userInfo.summary.latest_passed_level = this.levelData.levelIndex;
                qc.eventManager.emit(EventDef.Update_Level, true);
            }
            else {// 解锁下一张地图//
                mapId += 1;
                if (LevelMgr.ins.getMap(mapId)) {
                    PlayerMgr.ins.userInfo.summary.map_on++;
                    let levelConfig = LevelMgr.ins.getLevel(mapId, nextLevel);
                    // 成功解锁//
                    if (levelConfig && levelConfig.unlock_stars && PlayerMgr.ins.userInfo.summary.total_stars >= levelConfig.unlock_stars) {
                        PlayerMgr.ins.userInfo.summary.latest_passed_level++;
                        qc.eventManager.emit(EventDef.Unlock_Map);
                    }
                }
                else {
                    qc.eventManager.emit(EventDef.Jump_Level, PlayerMgr.ins.userInfo.summary.map_on, PlayerMgr.ins.userInfo.summary.latest_passed_level);
                }
            }
        }
        else {
            qc.eventManager.emit(EventDef.Jump_Level, PlayerMgr.ins.userInfo.summary.map_on, PlayerMgr.ins.userInfo.summary.latest_passed_level);
        }
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
        this._resetStatus();
    }

    private _resetStatus(isReplay: boolean = false) {
        this.gameStatus.gameFailed = false;
        this.gameStatus.gameSuccess = false;
        this.gameStatus.matchStableComplete = false;
        this.gameStatus.progressFinish = false;
        this.gameStatus.stepLeftReduceComplete = false;
        this.noNeedToCheckGameStatus = false;
        this._isFinish = false;
        if (isReplay) {
            this.isFirstStableHappened = false;
        }
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

    private _setToolFromGameStart(cb: Function) {
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
                effectLineStarScript.startMove(randomCell, (cell: Cell) => {
                    if (cell) {
                        let iTool: ITool = new BoomMatchTool();
                        if (!cell.node) {
                            ConstStatus.getInstance().fillState.fillWithTool(cell, iTool);
                        }
                        else {
                            let cellScript: CellScript = cell.node.getComponent(CellScript);
                            if (cellScript) {
                                cellScript.setToolType(+tool);
                                ConstStatus.getInstance().fillState.setWithTool(cell, iTool);
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
                    let item: IItem = ItemMgr.ins.getItem(itemType);
                    if (item) {
                        ItemMgr.ins.useItem(item.type, this.levelData.levelIndex, () => {
                            PlayerMgr.ins.addItem(itemType, -1);
                        });
                    }
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
        if (this.settingNode.active) {
            this.settingNode.active = false;
            this.settingMask.active = false;
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

    private _checkGuide() {
        // test
        // GuideMgr.ins.lastGuideType = GuideType.Invalid;
        // test

        // 第1关消除强制引导
        if (GuideMgr.ins.checkGuide(GuideType.Force_Level_1_Eliminate) && this.levelConfig.levelIndex === 1) {
            GuideMgr.ins.forceGuide_Eliminate(this.levelData.guide_cells, this.levelGridScript.grid.cells, this.node, GuideType.Force_Level_1_Eliminate, () => {
                GuideMgr.ins.level_1_ForceGuideSelectTool(this.tools.getChildByName('HammerBtn'), this.node, ItemType.Hammer, () => {
                    // 特殊选中一个格子，已免大面积消除
                    let selectCell = this.levelGridScript.grid.cells[1][1];
                    GuideMgr.ins.forceGuideUseTool(selectCell.node, this.node, GuideType.Force_Level_1_Use_Hammer, null);
                });
            });
        }
        // 第2关强制引导
        else if (GuideMgr.ins.checkGuide(GuideType.Force_Level_2_Eliminate) && this.levelConfig.levelIndex === 2) {
            GuideMgr.ins.forceGuide_Eliminate(this.levelData.guide_cells, this.levelGridScript.grid.cells, this.node, GuideType.Force_Level_2_Eliminate, null);
        }
        // 第3关强制引导
        else if (GuideMgr.ins.checkGuide(GuideType.Force_Level_3_Eliminate) && this.levelConfig.levelIndex === 3) {
            GuideMgr.ins.forceGuide_Eliminate(this.levelData.guide_cells, this.levelGridScript.grid.cells, this.node, GuideType.Force_Level_3_Eliminate, null);
        }
    }

    onSoundClick() {
        if (this._soundCD) {
            return;
        }
        this._soundCD = .5;
        if (this.soundSprite.index === 0) {
            SettingMgr.ins.soundEnabled = false;
        }
        else {
            SettingMgr.ins.soundEnabled = true;
        }
        SettingMgr.ins.initSound();
        qc.eventManager.emit(EventDef.UpdateSoundStatus);
    }
    onMusicClick() {
        if (this._musicCD) {
            return;
        }
        this._musicCD = .5;
        if (this.musicSprite.index === 0) {
            musicMgr.ins.stopMusic();
            SettingMgr.ins.musicEnabled = false;
            SettingMgr.ins.initMusic();
        }
        else {
            SettingMgr.ins.musicEnabled = true;
            SettingMgr.ins.initMusic();
            musicMgr.ins.playMusic('bg_music');
        }
        qc.eventManager.emit(EventDef.UpdateMusicStatus);
    }

    onVibrationClick() {
        if (this._vibrateCD) {
            return;
        }
        this._vibrateCD = .5;
        if (this.vibrateSprite.index === 0) {
            SettingMgr.ins.vibrateEnabled = false;
        }
        else {
            SettingMgr.ins.vibrateEnabled = true;
        }
        qc.eventManager.emit(EventDef.UpdateVibrateStatus);
    }

    onExitClick() {
        if (this._isFinish) {
            return;
        }
        if (!(this.levelGridScript.getGridStateMachine().getCurrentState() instanceof IdelState)) {
            return;
        }
        this.settingNode.active = false;
        this.settingMask.active = false;
        qc.panelRouter.showPanel(
            {
                panel: PanelConfigs.gameExitPanel,
                data: {
                    onExit: () => {
                        if (this._isFinish) {
                            return;
                        }
                        this._backToMainPanel();
                    },
                    onReplay: () => {
                        if (this._isFinish) {
                            return;
                        }
                        if (PlayerMgr.ins.userInfo.props.strength < Constants.Energy_Cost) {
                            CommonTipsMgr.ins.showTips('体力不足');
                            return;
                        }

                        // 新手引导第一关特殊处理 在结算时才发送使用道具给服务器，避免玩家在游戏中就把道具使用了，但未完成引导，再次触发引导时没有道具可用,这里如果重玩需要给玩家加回去
                        if (this.levelData.levelIndex === 1 && PlayerMgr.ins.userInfo.current_level.length === 0) {
                            if (PlayerMgr.ins.getItemNum(ItemType.Hammer) === 0) {
                                PlayerMgr.ins.addItem(ItemType.Hammer, 1);
                            }
                            if (PlayerMgr.ins.getItemNum(ItemType.Boom) === 0) {
                                PlayerMgr.ins.addItem(ItemType.Boom, 1);
                            }
                        }
                        LevelMgr.ins.goToLevel(this.levelData.mapId, this.levelData.levelIndex, null, (selectTools: { [id: number]: number }) => {
                            LevelMgr.ins.replay(this.levelData.levelIndex, () => {
                                PlayerMgr.ins.addEnergy(-Constants.Energy_Cost);
                                this._seletToolFromGameStart = selectTools;
                                this._init(true);
                                this._resetStatus(true);
                            });
                        });
                    },
                }
            }
        );
    }

    private _updateSoundStatus() {
        this.soundSprite.index = SettingMgr.ins.soundEnabled ? 0 : 1;
    }
    private _updateMusicStatus() {
        this.musicSprite.index = SettingMgr.ins.musicEnabled ? 0 : 1;
    }

    onSettingClick() {
        if (!this.isFirstStableHappened) {
            return;
        }
        this.settingNode.active = !this.settingNode.active;
        this.settingMask.active = this.settingNode.active;
    }

    private _updateVibrateStatus() {
        this.vibrateSprite.index = SettingMgr.ins.vibrateEnabled ? 0 : 1;
    }

    private _selectBoomGuide() {
        GuideMgr.ins.level_1_ForceGuideSelectTool(this.tools.getChildByName('BoomBtn'), this.node, ItemType.Boom, () => {
            // 特殊选中一个格子，已免大面积消除
            let selectCell = this.levelGridScript.grid.cells[7][1];
            GuideMgr.ins.forceGuideUseTool(selectCell.node, this.node, GuideType.Force_Level_1_Use_Boom, null);
        });
    }

    private _passTargetGuide() {
        GuideMgr.ins.level_1_ForceGuideOnlyTips(this.goalLayoutNode, this.node, GuideType.Force_Level_1_Pass_Target, () => {
            GuideMgr.ins.level_1_ForceGuideOnlyTips(this.stepsValueNode.children[0], this.node, GuideType.Force_Level_1_Left_Steps, null);
        });
    }

    private _useColMatch() {
        let cells = this.levelGridScript.grid.cells;
        let toolNode: Node = null;
        let count = 0;
        for (let i = 0; i < cells.length; i++) {
            for (let j = 0; j < cells[i].length; j++) {
                let cell = cells[i][j];
                if (cell.tool && cell.tool.getType() == ToolType.COL_MATCH) {
                    toolNode = cell.node;
                    count++;
                    if (count === 2) {
                        break;
                    }
                }
                if (cell.node && cell.node['guidecantclick']) {
                    cell.node['guidecantclick'] = false;
                    count++;
                    if (count === 2) {
                        break;
                    }
                }
            }
        }
        if (toolNode) {
            GuideMgr.ins.forceGuideUseTool(toolNode, this.node, GuideType.Force_Level_2_Use_ColMatch, null);
        }
    }

    private _useBoomMatch() {
        let cells = this.levelGridScript.grid.cells;
        let toolNode: Node = null;
        for (let i = 0; i < cells.length; i++) {
            for (let j = 0; j < cells[i].length; j++) {
                let cell = cells[i][j];
                if (cell.tool && cell.tool.getType() == ToolType.BOOM_MATCH) {
                    toolNode = cell.node;
                    break;
                }
            }
        }
        if (toolNode) {
            GuideMgr.ins.forceGuideUseTool(toolNode, this.node, GuideType.Force_Level_3_Use_Boom, null);
        }
    }

    private _showGameTarget() {
        this.gameShowTarget.showTarget(this.levelConfig);
        setTimeout(() => {
            this.gameShowTarget.hideTarget();
            this._checkGuide();
        }, 800);
    }

    private _updateTheme(theme_id: string) {
        CocosUtils.loadTextureFromBundle(BundleConfigs.gameBundle, `textures/map_${theme_id}`, this.bgSprite, () => {
            this.bgSprite.getComponent(Widget).updateAlignment();
        });
    }

    closeSetting() {
        if (this.settingNode.active) {
            this.settingNode.active = false;
        }
        if (this.settingMask.active) {
            this.settingMask.active = false;
        }
    }

    private _onshow() {
        this._musicCD = 1;
        this._soundCD = 1;
        this._vibrateCD = 1;
    }
}