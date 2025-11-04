import { _decorator, Component, instantiate, Node, Prefab, Sprite, UITransform, Vec2, Vec3, Size } from 'cc';
import { GameGrid } from '../../game/GameGrid';
import { BlockStateBase } from '../../game/state/BlockStateBase';
import { LevelConfig } from '../../configs/LevelConfig';
import { GameConstant, ITool, ToolType } from '../../game/GameConstant';
import { BlockIdleState } from '../../game/state/BlockIdleState';
import { BlockSwapState } from '../../game/state/BlockSwapState';
import { BlockFoundState } from '../../game/state/BlockFoundState';
import { BlockFillState } from '../../game/state/BlockFillState';
import { BlockRemoveState } from '../../game/state/BlockRemoveState';
import { BlockTouchMoveState, BlockTouchMoveEnterData } from '../../game/state/BlockTouchMoveState';
import { BlockFindState, BlockFindEnterData } from '../../game/state/BlockFindState';
import { BlockToolState, BlockToolEnterData } from '../../game/state/BlockToolState';
import { BlockErrState } from '../../game/state/BlockErrState';
import { RandomTool } from '../../game/tools/RandomTool';
import { HammerTool } from '../../game/tools/HammerTool';
import { StepsTool } from '../../game/tools/StepsTool';
import { BoomTool } from '../../game/tools/BoomTool';
import { GamePanel } from './GamePanel';
import { qc } from '../../framework/qc';
import EventDef from '../../constants/EventDef';
import { GuideType } from '../../manager/GuideMgr';
import CommonTipsMgr from '../../manager/CommonTipsMgr';
import GameStateMgr from '../../game/state/GameStateMgr';
import { Block } from '../../game/Block';
import { BlockComponent } from './BlockComponent';

const { ccclass, property } = _decorator;
export interface BlockGridListener {
    onBlockSwapStep: (from: Block, to: Block) => void;
    onBlockMatch: (blocks: Block[][]) => void;
    onBlockGridStable: () => void;
}

@ccclass('GameBlockGrid')
export class GameBlockGrid extends Component {
    @property(Prefab)
    blockPrefab: Prefab
    @property(Node)
    blockParent: Node;

    grid: GameGrid;
    stopGame: boolean = true;
    clickBlock1: Block;
    clickBlock2: Block;
    isSwaping: boolean = false;

    // 事件回调监听
    listener: BlockGridListener = null;

    private gridStateMachine: BlockStateBase;
    public getGridStateMachine() { return this.gridStateMachine; }

    private _gamepanel: GamePanel = null;
    public setGamePanel(gamepanel: GamePanel) {
        this._gamepanel = gamepanel;
    }

    public init(levelConfig: LevelConfig, isReplay: boolean) {
        this.grid = new GameGrid(levelConfig.gameGrid, GameConstant.BlockSize, levelConfig.blockTypes, levelConfig.blockGrid);
        this.initGridBlocks(isReplay);
        this.stopGame = false;

        GameStateMgr.ins.blockIdle = new BlockIdleState();
        this.gridStateMachine = new BlockStateBase(GameStateMgr.ins.blockIdle);
    }


    start() {
        // 初始化所asdfa有的状态
        // 初始asdfasdf化完成后进行检查
        this.initStates();
    }

    public initStates() {
        let mgr = GameStateMgr.ins;
        mgr.blockIdle.setListener(this.listener);
        mgr.blockSwap = new BlockSwapState(this.gridStateMachine);
        mgr.blockSwap.setListener(this.listener);
        mgr.blockFound = new BlockFoundState(this.gridStateMachine);
        mgr.blockFill = new BlockFillState(this.gridStateMachine);
        mgr.blockFill.setFillNewNodeFun(this.initBlockNode.bind(this));
        mgr.blockFill.setGamePanel(this._gamepanel);
        mgr.blockRemove = new BlockRemoveState(this.gridStateMachine);
        mgr.blockTouchMove = new BlockTouchMoveState(this.gridStateMachine);
        mgr.blockFind = new BlockFindState(this.gridStateMachine);
        mgr.blockFind.setListener(this.listener);
        mgr.blockTool = new BlockToolState(this.gridStateMachine);
        mgr.blockErr = new BlockErrState(this.gridStateMachine);

        this.gridStateMachine.toState(
            GameStateMgr.ins.blockFind,
            { grid: this.grid } as BlockFindEnterData);
    }

    update(deltaTime: number) {
        if (this.stopGame) {
            return;
        }
        this.gridStateMachine.shift();
    }

    public stop() {
        this.stopGame = true;
    }

    public setGridListener(listener: BlockGridListener) {
        this.listener = listener;
    }

    private initGridBlocks(isReplay: boolean) {
        if (isReplay) {
            this.blockParent.removeAllChildren();
        }
        const rows = this.grid.blocks.length;
        const cols = this.grid.blocks[0].length;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                let block = this.grid.blocks[i][j];
                this.initBlockNode(block);
            }
        };
    }

    private initBlockNode(block: Block) {
        block.blockNode = this.createBlock(block);
    }

    private createBlock(block: Block): Node {
        let nodeSize = new Size(this.grid.blockSize * GameConstant.BlockScale,
            this.grid.blockSize * GameConstant.BlockScale);
        let node = instantiate(this.blockPrefab)
        let nodeSpriteTransform = node.getComponent(Sprite).getComponent(UITransform)

        let nodeSacle = new Vec3(nodeSize.width / nodeSpriteTransform.width, nodeSize.height / nodeSpriteTransform.height, 1);
        node.setScale(nodeSacle);
        let icon = node.getChildByName("icon");
        if (icon) {
            icon.setScale(1 / nodeSacle.x, 1 / nodeSacle.y, 1);
        }
        this.blockParent.addChild(node);
        let blockScript = node.getComponent(BlockComponent);
        blockScript.setType(block.type);

        if (block.tool) {
            blockScript.setToolType(block.tool.getToolType());
        } else {
            blockScript.setToolType(ToolType.INVALID);
        }


        blockScript.setPosition(block.x, block.y, false);

        blockScript.setClick({
            onClick: (node: Node) => {
                if (this._gamepanel.isFinish) {
                    return;
                }
                if (node['guidecantclick']) {
                    return;
                }

                if (this._gamepanel.useToolType === ToolType.Hammer) {
                    if (node.getComponent(BlockComponent).getToolType() !== ToolType.INVALID) {
                        CommonTipsMgr.ins.showTips('无法消除道具');
                        return;
                    }
                    this._gamepanel.hideToolMask();
                    this.useHammerTool(node);
                    qc.eventManager.emit(EventDef.Game_Select_Tool_Success, ToolType.Hammer);
                    return;
                }
                if (this._gamepanel.useToolType === ToolType.Boom) {
                    this._gamepanel.hideToolMask();
                    this.useBoomTool(node);
                    qc.eventManager.emit(EventDef.Game_Select_Tool_Success, ToolType.Boom);
                    return;
                }
                // 如果不是idel不允许操作
                if (!(this.gridStateMachine.getCurrentState() instanceof BlockIdleState)) {
                    this.resetSwapBlock();
                    return;
                }
                let block = this.grid.findBlockByNode(node);
                // 如果点中的是彩虹糖豆则不能点击触发，需要和交换位置的block配对消除//
                if (block.tool && block.tool.getToolType() == ToolType.TypeMatch) {
                    this.setSwapBlock(block);
                    return;
                }
                // 如果选中了道具，则需要再点一次进行道具触发
                if (block.tool) {
                    let selectBlock = block.blockNode.getComponent(BlockComponent);
                    if (selectBlock.isSelected) {
                        let data = { block: block, grid: this.grid, tool: block.tool } as BlockToolEnterData;
                        this.gridStateMachine.toState(GameStateMgr.ins.blockTool, data);
                        this._gamepanel.minusSteps();
                    }
                    else {
                        this.setSwapBlock(block);
                    }
                } else {
                    this.setSwapBlock(block);
                }
            },
            onMoveDir: (node: Node, dir: Vec2) => {
                if (this._gamepanel.isFinish) {
                    return;
                }
                if (node['guidecantclick']) {
                    return;
                }
                // 如果不是idel不允许操作
                if (!(this.gridStateMachine.getCurrentState() instanceof BlockIdleState)) {
                    this.resetSwapBlock();
                    return;
                }
                // 使用底部道具时不能滑动
                if (this._gamepanel.useToolType === ToolType.Hammer || this._gamepanel.useToolType === ToolType.Boom) {
                    return;
                }
                this.resetSwapBlock();
                let block1 = this.grid.findBlockByNode(node);
                let block2 = this.grid.findBlockByBlockAndDir(block1, dir);

                if (block1 && block2) {
                    this.clickBlock1 = block1;
                    this.clickBlock2 = block2;
                    this.doSwap();
                } else {
                    this.resetSwapBlock();
                }
            }
        })
        return node;
    }

    private setSwapBlock(block: Block) {
        if (!block) {
            this.resetSwapBlock();
            return;
        }
        if (!this.clickBlock1) {
            this.clickBlock1 = block;
            this.setSelectBlock(this.clickBlock1, true);
        } else {
            this.clickBlock2 = block;
            this.doSwap();
        }
    }

    private setSelectBlock(block: Block, selected: boolean) {
        if (block && block.blockNode) {
            let blockScript = block.blockNode.getComponent(BlockComponent);
            blockScript.setSelect(selected);
        }
    }

    private resetSwapBlock() {
        this.isSwaping = false;
        this.setSelectBlock(this.clickBlock1, false);
        this.setSelectBlock(this.clickBlock2, false);
        this.clickBlock1 = null;
        this.clickBlock2 = null;
    }

    private doSwap(): boolean {
        if (!this.isSwaping && this.clickBlock1 && this.clickBlock2) {
            if (this.grid.canSwapBlock(this.clickBlock1, this.clickBlock2)) {
                this.isSwaping = true;
                let data = { block1: this.clickBlock1, block2: this.clickBlock2, grid: this.grid } as BlockTouchMoveEnterData;
                this.gridStateMachine.toState(GameStateMgr.ins.blockTouchMove, data);
                this.resetSwapBlock();
                return true;
            } else {
                this.resetSwapBlock();
            }
        }
        return false;
    }

    useRandomTool(tool: ITool) {
        let data = { block: null, grid: this.grid, tool: tool } as BlockToolEnterData;
        this.gridStateMachine.toState(GameStateMgr.ins.blockTool, data);
    }

    /**
     * 随机打乱网格, 随机的交换
     */
    randomGrid() {
        console.log("random grid");
        this.useRandomTool(new RandomTool())
    }

    useHammerTool(node: Node) {
        let block = this.grid.findBlockByNode(node);
        let data = { block: block, grid: this.grid, tool: new HammerTool() } as BlockToolEnterData;
        this.gridStateMachine.toState(GameStateMgr.ins.blockTool, data);
        qc.eventManager.emit(EventDef.HideGuide, GuideType.Force_Level_1_Use_Hammer);
    }

    useStepsTool() {
        let data = { block: null, grid: this.grid, tool: new StepsTool() } as BlockToolEnterData;
        this.gridStateMachine.toState(GameStateMgr.ins.blockTool, data);
    }

    useBoomTool(node: Node) {
        let block = this.grid.findBlockByNode(node);
        let data = { block: block, grid: this.grid, tool: new BoomTool() } as BlockToolEnterData;
        this.gridStateMachine.toState(GameStateMgr.ins.blockTool, data);
        qc.eventManager.emit(EventDef.HideGuide, GuideType.Force_Level_1_Use_Boom);
    }
}