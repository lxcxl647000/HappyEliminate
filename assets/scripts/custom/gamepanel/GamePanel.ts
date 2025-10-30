import { _decorator, instantiate, Label, log, Node, Prefab, Sprite, Vec3, Widget } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { LevelConfig } from '../../configs/LevelConfig';
import { GameScore } from '../../game/GameScore';
import { TargetProgressInfo } from '../../game/target/TargetProgressInfo';
import { ITarget } from '../../game/target/TargetTyps';
import { BlockType, GameConstant, ITool, ToolType } from '../../game/GameConstant';
import { qc } from '../../framework/qc';
import LevelMgr, { PassData, PassReward } from '../../manager/LevelMgr';
import PlayerMgr, { Currentlevel } from '../../manager/PlayerMgr';
import { PanelConfigs } from '../../configs/PanelConfigs';
import EventDef from '../../constants/EventDef';
import CocosUtils from '../../utils/CocosUtils';
import MathUtils from '../../utils/MathUtils';
import { BlockToolEnterData } from '../../game/state/BlockToolState';
import { BoomInGridTool } from '../../game/tools/BoomInGridTool';
import { ColTool } from '../../game/tools/ColTool';
import { RowTool } from '../../game/tools/RowTool';
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
import { BlockIdleState } from '../../game/state/BlockIdleState';
import CommonTipsMgr from '../../manager/CommonTipsMgr';
import { GameUtils } from '../../game/GameUtils';
import GameStateMgr from '../../game/state/GameStateMgr';
import { Block } from '../../game/Block';
import { BlockComponent } from './BlockComponent';
import { GameResult } from './GameResult';
import { GameBlockGrid } from './GameBlockGrid';
import { LineEffect } from './LineEffect';
import { StarProgress } from './StarProgress';
const { ccclass, property } = _decorator;
class GameStaus {
    progressFinish: boolean = false;
    stepLeftReduceComplete: boolean = false;
    matchStableComplete: boolean = false;

    gameSuccess: boolean = false;
    gameFailed: boolean = false;
}

@ccclass('GamePanel')
export class GamePanel extends PanelComponent {
    @property(Node)
    targetNode: Node
    @property([Prefab])
    targetPrefabs: Prefab[] = new Array<Prefab>();
    @property(StarProgress)
    starProgress: StarProgress
    @property(Node)
    stepsValueNode: Node
    @property(Node)
    levelGrid: Node
    @property(Node)
    tools: Node
    @property(Node)
    scoreValueNode: Node
    @property(GameResult)
    gameResult: GameResult;
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
    private scoreValue: GameScore = new GameScore();
    private stepsValue: number = 25;
    private targetProgress: TargetProgressInfo = new TargetProgressInfo();

    // 游戏asdfa操作
    private gameBlockGrid: GameBlockGrid;
    public getGameBlockGrid() { return this.gameBlockGrid; }

    // 游戏adfa目标
    private levelTarget: ITarget;

    // 第一次下落消asdfa除的不计分
    private isFirstStable: boolean = false;
    public getIsFirstStable() { return this.isFirstStable; }

    private _isFinish: boolean = false;
    public get isFinish() { return this._isFinish; }

    // 游戏状态，用来判adfa断游戏是否结束
    private gameStatus: GameStaus = new GameStaus();

    // 剩余步数转换成道adsfasd具需要的道具//
    private _needRandomTools: ToolType[] = [ToolType.BoomInGrid, ToolType.Row, ToolType.Col];

    // 当前选中底部使用asdfasdf的道具类型//
    private _useToolType: ToolType = ToolType.INVALID;
    public get useToolType() { return this._useToolType; }

    private _seletToolFromGameStart: { [id: number]: number } = {};

    private _selectTools: ToolType[] = [ToolType.Hammer, ToolType.Random, ToolType.Boom, ToolType.Steps];

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

        this.levelValue.string = this.levelData.lvID.toString();

        //监听游戏操作
        this.gameBlockGrid = this.levelGrid.getComponent(GameBlockGrid);
        this.gameBlockGrid.setGamePanel(this);
        this.gameBlockGrid.init(this.levelData, isReplay);

        if (!isReplay) {
            this.gameBlockGrid.setGridListener({
                onBlockSwapStep: (from: Block, to: Block) => {
                    if (!this.isFirstStable) {
                        return;
                    }

                    this.stepsValue--;
                    this.updateStepNode();
                    this.updateTargetNode();
                },
                onBlockMatch: (blocks: Block[][]) => {
                    if (!this.isFirstStable) {
                        return;
                    }

                    // 消除的时候计分
                    this.scoreValue.updateScore(blocks);

                    // 计算消除个数
                    if (blocks) {
                        for (const blockItems of blocks) {
                            const reduceSuccessBlocks = this.targetProgress.checkReduce(blockItems);
                            if (reduceSuccessBlocks.length > 0) {
                                // 增加一个动画将元素 移动到target
                                for (const reduceItem of reduceSuccessBlocks) {
                                    const moveToTargetNode = instantiate(reduceItem.blockNode);
                                    this.levelGrid.addChild(moveToTargetNode);

                                    let target = this._findTarget(reduceItem.type);
                                    let pos = new Vec3(0, 500, 0);
                                    let moveToTargetBlock = moveToTargetNode.getComponent(BlockComponent)
                                    if (target) {
                                        pos = CocosUtils.setNodeToTargetPos(moveToTargetBlock.node, target);
                                    }
                                    moveToTargetBlock.moveAndDisappear(pos, () => {

                                        this.updateScoreAndProgress()
                                        this.updateTargetNode();
                                        this.gameStatus.matchStableComplete = false;
                                    });
                                }
                            }
                        }
                    }


                },
                onBlockGridStable: () => {
                    let func = () => {
                        if (!this.isFirstStable) {
                            this.isFirstStable = true;

                            // 特殊处理如果是第一关，就给玩家存个档表示已经玩了第一关了，不一定是要通关，因为主界面有去玩第一关的强制引导需要这个存档
                            if (this.levelData.lvID === 1 && PlayerMgr.ins.userInfo.current_level.length === 0) {
                                qc.storage.setItem(GameConstant.Force_Guide_Level_1_KEY, 1);
                            }

                            this._showGameTarget();
                        }
                        else {
                            if (GuideMgr.ins.checkGuide(GuideType.Force_Level_2_Use_ColMatch) && this.levelData.lvID === 2) {
                                this._useColMatch();
                                qc.eventManager.emit(EventDef.HideGuide, GuideType.Force_Level_2_Eliminate);
                            }
                            if (GuideMgr.ins.checkGuide(GuideType.Force_Level_3_Use_Boom) && this.levelData.lvID === 3) {
                                this._useBoomMatch();
                            }
                        }

                        // 停止连续消除计分
                        this.scoreValue.continueEnd();

                        // 检查游戏是否结束
                        if (this.levelTarget.isComplete()) {
                            this._isFinish = true;
                            this.leftStepsToScore(() => {
                                this.gameStatus.gameSuccess = true;
                            });
                        } else if (this.stepsValue <= 0) {
                            this._isFinish = true;
                            this.gameStatus.gameFailed = true;
                            this.leftStepsToScore();
                        }

                        this.gameStatus.matchStableComplete = true;
                    };

                    if (!this.isFirstStable) {
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
            this.gameBlockGrid.initStates();
        }
        qc.eventManager.emit(EventDef.Close_Loading);
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
        qc.eventManager.on(EventDef.Trigger_Tools, this._triggerTools, this);
        qc.eventManager.on(EventDef.Trigger_Tool, this._triggerToolBlock, this);
        qc.eventManager.on(EventDef.Replay_Btn_Event, this._replayBtnEvent, this);
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
        qc.eventManager.off(EventDef.Trigger_Tools, this._triggerTools, this);
        qc.eventManager.off(EventDef.Replay_Btn_Event, this._replayBtnEvent, this);
        qc.eventManager.off(EventDef.Trigger_Tool, this._triggerToolBlock, this);
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

        // 根据类adsf型显示目标
        this.initTarget(levelConfig, isReplay);

        this.updateStepNode();
        this.updateScoreNode();

        // 隐藏游戏adsfa结束弹窗
        this.gameResult.node.active = false;
    }

    /**
     * 根据adsfa关卡的目标，生成不同的目标Node
     * @param levelConfig 
     */
    private initTarget(levelConfig: LevelConfig, isReplay: boolean) {
        this.levelTarget = GameUtils.addTarget(levelConfig.target, this.targetPrefabs, this.targetNode, isReplay);
        this.targetProgress = this.levelTarget.getTarget();

        // 三星adsfa进度
        this.starProgress.setProgress(0);
    }

    private leftStepsToScore(cb?: Function) {
        this.gameStatus.stepLeftReduceComplete = false;
        let lineArr: Node[] = [];
        let randomBlocks: Block[] = [];

        if (this.stepsValue > 0) {
            const intervalTime = GameConstant.ChangeProgressTime * 1000;
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

                const lineEffectNode = instantiate(this.lineStarPrefab);
                this.node.addChild(lineEffectNode);

                let randomBlock = this.gameBlockGrid.grid.randomBlock();
                randomBlocks.push(randomBlock);

                let fromPos = CocosUtils.setNodeToTargetPos(lineEffectNode, this.stepsValueNode);
                let toPos = CocosUtils.setNodeToTargetPos(lineEffectNode, randomBlock.node);
                let lineEffect = lineEffectNode.getComponent(LineEffect);
                lineEffect.setDuration(.4);
                lineEffect.setLinePath(fromPos, toPos);
                lineEffectNode.setPosition(fromPos);
                lineEffectNode.active = false;
                lineArr.push(lineEffectNode);
            }

            this.scheduleOnce(() => {
                if (randomBlocks.length === 0) {
                    this.gameStatus.stepLeftReduceComplete = true;
                    cb && cb();
                }
                else {
                    for (let i = 0; i < randomBlocks.length; i++) {
                        let block = randomBlocks[i];
                        this.gameBlockGrid.getGridStateMachine().toState(
                            GameStateMgr.ins.blockTool,
                            {
                                block: block,
                                tool: block.tool,
                                grid: this.gameBlockGrid.grid
                            } as BlockToolEnterData
                        );
                    }
                }
            }, GameConstant.ChangeProgressTime * randomBlocks.length + .5);

            let index = 0;
            for (let i = 0; i < randomBlocks.length; i++) {
                let line = lineArr[i];
                let lineEffect = line.getComponent(LineEffect);
                setTimeout(() => {
                    if (index >= randomBlocks.length) {
                        return;
                    }
                    lineEffect.node.active = true;
                    lineEffect.startToMove(randomBlocks[index], (block: Block) => {
                        let type = MathUtils.randomSort(this._needRandomTools)[0];
                        let iTool: ITool = null;
                        switch (type) {
                            case ToolType.BoomInGrid:
                                iTool = new BoomInGridTool();
                                break;
                            case ToolType.Col:
                                iTool = new ColTool();
                                break;
                            case ToolType.Row:
                                iTool = new RowTool();
                                break;
                        }
                        if (!block.blockNode) {
                            GameStateMgr.ins.blockFill.fillWithTool(block, iTool);
                        }
                        else {
                            let blockScript = block.blockNode.getComponent(BlockComponent);
                            if (blockScript) {
                                blockScript.setToolType(type);
                                GameStateMgr.ins.blockFill.setWithTool(block, iTool);
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
        qc.platform.fromOtherAppToCompleteTask('game');
        this.gameBlockGrid.stop();

        // 更新游戏进度
        this.updateGameStorage();

        // 新手引导第一关特殊处理 在结算时才发送使用道具给服务器，避免玩家在游戏中就把道具使用了，但未完成引导，再次触发引导时没有道具可用
        if (this.levelData.lvID === 1 && PlayerMgr.ins.userInfo.current_level.length === 0) {
            let item: IItem = ItemMgr.ins.getItem(ItemType.Hammer);
            if (item) {
                ItemMgr.ins.useItem(item.type, this.levelData.lvID, null);
            }
            item = ItemMgr.ins.getItem(ItemType.Boom);
            if (item) {
                ItemMgr.ins.useItem(item.type, this.levelData.lvID, null);
            }
        }

        qc.platform.reportScene(401);
        LevelMgr.ins.sendLevelPassToServer(this.levelData.lvID,
            this.starProgress.getStarCount(),
            this.scoreValue.score,
            PlayerMgr.ins.userInfo.summary.map_on,
            (data: PassData) => {
                // 显示游戏结束弹窗
                this.showGameDialog(true, data.rewards);
            });
    }

    // 更新分数和进度
    private updateScoreAndProgress() {
        this.targetProgress.score = this.scoreValue.score;
        // 计算3星进度
        // 三星进度, 乘上100，是为了计算百分比
        let progress = this.targetProgress.score * 100 / this.levelData.fullStar;

        this.gameStatus.progressFinish = false;
        this.starProgress.setProgress(progress, () => {
            this.gameStatus.progressFinish = true;
        });

        this.updateScoreNode();
    }


    private showGameDialog(success: boolean, rewards?: PassReward[]) {
        this.gameResult.node.active = true;
        this.gameResult.setScore(this.targetProgress.score);
        this.gameResult.setStarCount(this.starProgress.getStarCount());
        this.gameResult.setSuccess(success, this.levelData);
        if (success) {
            this.gameResult.setRewards(rewards);
        }

        this.gameResult.show({
            onConform: () => {
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
        this.levelData.starCount = this.starProgress.getStarCount();

        // 顺利过关通过分数计算是0星的话给1星//
        if (this.levelData.starCount === 0) {
            this.levelData.starCount = 1;
        }

        let levelInfo: Currentlevel = {
            level_no: this.levelData.lvID,
            best_score: this.scoreValue.score,
            best_stars: this.levelData.starCount,
            play_times: 0,
            pass_status: '',
            create_time: '',
            update_time: ''
        };
        if (PlayerMgr.ins.userInfo.current_level.length < this.levelData.lvID) {
            PlayerMgr.ins.userInfo.summary.total_stars += this.levelData.starCount;
        }
        else {
            let curLevel = PlayerMgr.ins.userInfo.current_level[this.levelData.lvID - 1];
            if (curLevel.best_stars < this.levelData.starCount) {
                PlayerMgr.ins.userInfo.summary.total_stars += this.levelData.starCount - curLevel.best_stars;
                curLevel.best_stars = this.levelData.starCount;
            }
            else {
                this.levelData.starCount = curLevel.best_stars;
            }
        }

        PlayerMgr.ins.setLevelInfo(levelInfo);
        PlayerMgr.ins.userInfo.summary.total_score += this.scoreValue.score;
        qc.eventManager.emit(EventDef.Update_Stars, this.levelData.lvID, this.levelData.starCount);
        if (this.levelData.lvID > PlayerMgr.ins.userInfo.summary.latest_passed_level) {
            let nextLevel = this.levelData.lvID + 1;
            let mapId = PlayerMgr.ins.userInfo.summary.map_on;
            if (LevelMgr.ins.getLevel(mapId, nextLevel)) {
                PlayerMgr.ins.userInfo.summary.latest_passed_level = this.levelData.lvID;
                qc.eventManager.emit(EventDef.Update_Level, true);
            }
            else {// 解锁下一张地图//
                mapId += 1;
                if (LevelMgr.ins.getMap(mapId)) {
                    PlayerMgr.ins.userInfo.summary.map_on++;
                    let levelConfig = LevelMgr.ins.getLevel(mapId, nextLevel);
                    // 成功解锁//
                    let stars = PlayerMgr.ins.getMapStars(mapId - 1);
                    if (levelConfig && levelConfig.unlock_stars && stars >= levelConfig.unlock_stars) {
                        PlayerMgr.ins.userInfo.summary.latest_passed_level++;
                        qc.eventManager.emit(EventDef.Unlock_Map);
                    }
                    // 未解锁成功
                    else {
                        PlayerMgr.ins.userInfo.summary.map_on--;
                        PlayerMgr.ins.userInfo.summary.latest_passed_level = this.levelData.lvID;
                        qc.eventManager.emit(EventDef.Update_Level, true);
                    }
                }
                else {
                    qc.eventManager.emit(EventDef.Jump_Level, PlayerMgr.ins.userInfo.summary.map_on, PlayerMgr.ins.userInfo.summary.latest_passed_level);
                }
            }
        }
        else {
            let nextMap = LevelMgr.ins.getMap(PlayerMgr.ins.userInfo.summary.map_on + 1);
            if (nextMap) {
                let lvConfig = nextMap.values().next().value as LevelConfig;
                if (lvConfig.unlock_stars <= PlayerMgr.ins.getMapStars(PlayerMgr.ins.userInfo.summary.map_on)) {
                    let passCount = PlayerMgr.ins.getPassLevels(PlayerMgr.ins.userInfo.summary.map_on);
                    let map = LevelMgr.ins.getMap(PlayerMgr.ins.userInfo.summary.map_on);
                    if (passCount >= map.size) {// 解锁成功
                        PlayerMgr.ins.userInfo.summary.map_on++;
                        qc.eventManager.emit(EventDef.Unlock_Map);
                    }
                    else {
                        qc.eventManager.emit(EventDef.Jump_Level, PlayerMgr.ins.userInfo.summary.map_on, PlayerMgr.ins.userInfo.summary.latest_passed_level);
                    }
                }
                else {
                    qc.eventManager.emit(EventDef.Jump_Level, PlayerMgr.ins.userInfo.summary.map_on, PlayerMgr.ins.userInfo.summary.latest_passed_level);
                }
            }
            else {
                qc.eventManager.emit(EventDef.Jump_Level, PlayerMgr.ins.userInfo.summary.map_on, PlayerMgr.ins.userInfo.summary.latest_passed_level);
            }
        }
    }

    private updateStepNode() {
        this.stepsValueNode.getComponent(Label).string = JSON.stringify(this.stepsValue);
    }
    private updateScoreNode() {
        this.scoreValueNode.getComponent(Label).string = JSON.stringify(this.scoreValue.score);
    }
    private updateTargetNode() {
        this.levelTarget.updateTarget(this.targetProgress);
    }

    public _resurrection() {
        this._addSteps(GameConstant.Resurrection_Add_Steps);
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
            this.isFirstStable = false;
        }
    }

    private _addSteps(steps: number) {
        this.stepsValue += steps;
        this.updateStepNode();
    }

    private _findTarget(type: BlockType): Node {
        let target: Node = null;
        let targetParent = this.targetNode.children[0];
        for (let child of targetParent.children) {
            if (child.active) {
                let block = child.getComponentInChildren(BlockComponent);
                if (type === block.blockType) {
                    target = block.node;
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
        this.toolTitle.getChildByName('des').getComponent(Label).string = type === ToolType.Hammer ? '点击任意一格敲碎障碍' : '点击任意地方可大范围消除';
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
                let randomBlock = +tool === ToolType.Steps ? null : this.gameBlockGrid.grid.randomBlock();
                let fromPos = CocosUtils.setNodeToTargetPos(lineStarNode, this.selectToolFrom);
                let toPos = CocosUtils.setNodeToTargetPos(lineStarNode, randomBlock ? randomBlock.node : this.stepsValueNode);
                let lineEffect = lineStarNode.getComponent(LineEffect);
                lineEffect.setDuration(.4);
                lineEffect.setLinePath(fromPos, toPos);
                lineEffect.startToMove(randomBlock, (block: Block) => {
                    if (block) {
                        let iTool: ITool = new BoomInGridTool();
                        if (!block.blockNode) {
                            GameStateMgr.ins.blockFill.fillWithTool(block, iTool);
                        }
                        else {
                            let blockScript: BlockComponent = block.blockNode.getComponent(BlockComponent);
                            if (blockScript) {
                                blockScript.setToolType(+tool);
                                GameStateMgr.ins.blockFill.setWithTool(block, iTool);
                            }
                        }
                        if (--count === 0) {
                            cb && cb();
                        }
                    }
                    else {
                        this._addSteps(GameConstant.Tool_Add_Steps);
                        if (--count === 0) {
                            cb && cb();
                        }
                    }
                    let itemType = +tool === ToolType.Steps ? ItemType.Steps : ItemType.Boom;
                    let item: IItem = ItemMgr.ins.getItem(itemType);
                    if (item) {
                        ItemMgr.ins.useItem(item.type, this.levelData.lvID, () => {
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
            case ToolType.Hammer:
            case ToolType.Boom:
                this.showToolMask(type);
                break;
            case ToolType.Steps:
                this.gameBlockGrid.useStepsTool();
                qc.eventManager.emit(EventDef.Game_Select_Tool_Success, type);
                break;
            case ToolType.Random:
                this.gameBlockGrid.randomGrid();
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
        if (GuideMgr.ins.checkGuide(GuideType.Force_Level_1_Eliminate) && this.levelConfig.lvID === 1) {
            GuideMgr.ins.forceGuide_Eliminate(this.levelData.guideBlocks, this.gameBlockGrid.grid.blocks, this.node, GuideType.Force_Level_1_Eliminate, () => {
                GuideMgr.ins.level_1_ForceGuideSelectTool(this.tools.getChildByName('HammerBtn'), this.node, ItemType.Hammer, () => {
                    // 特殊选中一个格子，已免大面积消除
                    let selectBlock = this.gameBlockGrid.grid.blocks[1][1];
                    GuideMgr.ins.forceGuideUseTool(selectBlock.blockNode, this.node, GuideType.Force_Level_1_Use_Hammer, null);
                });
            });
        }
        // 第2关强制引导
        else if (GuideMgr.ins.checkGuide(GuideType.Force_Level_2_Eliminate) && this.levelConfig.lvID === 2) {
            GuideMgr.ins.forceGuide_Eliminate(this.levelData.guideBlocks, this.gameBlockGrid.grid.blocks, this.node, GuideType.Force_Level_2_Eliminate, null);
        }
        // 第3关强制引导
        else if (GuideMgr.ins.checkGuide(GuideType.Force_Level_3_Eliminate) && this.levelConfig.lvID === 3) {
            GuideMgr.ins.forceGuide_Eliminate(this.levelData.guideBlocks, this.gameBlockGrid.grid.blocks, this.node, GuideType.Force_Level_3_Eliminate, null);
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
        if (!(this.gameBlockGrid.getGridStateMachine().getCurrentState() instanceof BlockIdleState)) {
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
                        this._replayBtnEvent();
                    },
                }
            }
        );
    }

    private _replayBtnEvent(isFromPassFail: boolean = false) {
        if (PlayerMgr.ins.userInfo.props.strength < GameConstant.Energy_Cost) {
            CommonTipsMgr.ins.showTips('体力不足');
            return;
        }

        // 新手引导第一关特殊处理 在结算时才发送使用道具给服务器，避免玩家在游戏中就把道具使用了，但未完成引导，再次触发引导时没有道具可用,这里如果重玩需要给玩家加回去
        if (this.levelData.lvID === 1 && PlayerMgr.ins.userInfo.current_level.length === 0) {
            if (PlayerMgr.ins.getItemNum(ItemType.Hammer) === 0) {
                PlayerMgr.ins.addItem(ItemType.Hammer, 1);
            }
            if (PlayerMgr.ins.getItemNum(ItemType.Boom) === 0) {
                PlayerMgr.ins.addItem(ItemType.Boom, 1);
            }
        }
        LevelMgr.ins.goToLevel(this.levelData.mapId, this.levelData.lvID, null, (selectTools: { [id: number]: number }) => {
            LevelMgr.ins.replay(this.levelData.lvID, () => {
                PlayerMgr.ins.addEnergy(-GameConstant.Energy_Cost);
                this._seletToolFromGameStart = selectTools;
                this._init(true);
                this._resetStatus(true);
            });
        }, isFromPassFail ? () => {
            this._backToMainPanel();
        } : null);
    }

    private _updateSoundStatus() {
        this.soundSprite.index = SettingMgr.ins.soundEnabled ? 0 : 1;
    }
    private _updateMusicStatus() {
        this.musicSprite.index = SettingMgr.ins.musicEnabled ? 0 : 1;
    }

    onSettingClick() {
        if (!this.isFirstStable) {
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
            let selectBlock = this.gameBlockGrid.grid.blocks[7][1];
            GuideMgr.ins.forceGuideUseTool(selectBlock.blockNode, this.node, GuideType.Force_Level_1_Use_Boom, null);
        });
    }

    private _passTargetGuide() {
        GuideMgr.ins.level_1_ForceGuideOnlyTips(this.targetNode, this.node, GuideType.Force_Level_1_Pass_Target, () => {
            GuideMgr.ins.level_1_ForceGuideOnlyTips(this.stepsValueNode.children[0], this.node, GuideType.Force_Level_1_Left_Steps, null);
        });
    }

    private _useColMatch() {
        let blocks = this.gameBlockGrid.grid.blocks;
        let toolNode: Node = null;
        let count = 0;
        for (let i = 0; i < blocks.length; i++) {
            for (let j = 0; j < blocks[i].length; j++) {
                let block = blocks[i][j];
                if (block.tool && block.tool.getToolType() == ToolType.Col) {
                    toolNode = block.blockNode;
                    count++;
                    if (count === 2) {
                        break;
                    }
                }
                if (block.blockNode && block.blockNode['guidecantclick']) {
                    block.blockNode['guidecantclick'] = false;
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
        let blocks = this.gameBlockGrid.grid.blocks;
        let toolNode: Node = null;
        for (let i = 0; i < blocks.length; i++) {
            for (let j = 0; j < blocks[i].length; j++) {
                let block = blocks[i][j];
                if (block.tool && block.tool.getToolType() == ToolType.BoomInGrid) {
                    toolNode = block.blockNode;
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

    onCloseExchangeTool() {
        if (this.exchangeTool.node.active) {
            this.exchangeTool.node.active = false;
        }
    }

    public setUseHammerGuideTips(tipsNode: Node) {
        this.toolTitle.active = false;
        let pos = CocosUtils.setNodeToTargetPos(tipsNode, this.toolTitle);
        tipsNode.setPosition(pos);
        tipsNode.active = true;
    }

    public minusSteps() {
        this.stepsValue--;
        this.updateStepNode();
    }

    private _triggerTools(toolBlocks: Block[]) {
        for (let i = 0; i < toolBlocks.length; i++) {
            let block = toolBlocks[i];
            this.gameBlockGrid.getGridStateMachine().toState(
                GameStateMgr.ins.blockTool,
                {
                    block: block,
                    tool: block.tool,
                    grid: this.gameBlockGrid.grid
                } as BlockToolEnterData
            );
        }
    }

    private _triggerToolBlock(data: BlockToolEnterData) {
        this.gameBlockGrid.getGridStateMachine().toState(GameStateMgr.ins.blockTool, data);
    }
}