import { IStateEnterData, IState, BlockState } from "./BlockStateBase";
import { BlockFindState, BlockFindEnterData } from "./BlockFindState";
import { GameGrid } from "../GameGrid";
import { Vec2 } from "cc";
import { RowTool } from "../tools/RowTool";
import { BoomInGridTool } from "../tools/BoomInGridTool";
import { ColTool } from "../tools/ColTool";
import { TypeTool } from "../tools/TypeTool";
import { GamePanel } from "../../custom/gamepanel/GamePanel";
import { musicMgr } from "../../manager/musicMgr";
import GuideMgr, { GuideType } from "../../manager/GuideMgr";
import { qc } from "../../framework/qc";
import EventDef from "../../constants/EventDef";
import GameStateMgr from "./GameStateMgr";
import { Block } from "../Block";
import { BlockComponent } from "../../custom/gamepanel/BlockComponent";
import { ITool } from "../GameConstant";

export class BlockFillEnterData extends IStateEnterData {
    matches: Block[][];
    grid: GameGrid;
    swapBlockFrom?: Block;
    swapBlockTo?: Block;
}

export class BlockFillState extends BlockState {
    private fillNewNode: (block: Block) => void;
    public setFillNewNodeFun(fillNewNode: (block: Block) => void) {
        this.fillNewNode = fillNewNode;
    }
    private _gamePanel: GamePanel = null;
    public setGamePanel(gamePanel: GamePanel) { this._gamePanel = gamePanel; }
    checkToState(state: IState): boolean {
        return state instanceof BlockFindState;
    }
    onStateEnter(data: BlockFillEnterData): void {
        this.checkToGenerateTools(data);
        data.grid.dropBlocks({
            onBlockDrop: (from: Block, to: Block) => {
                data.grid.swapBlock(from, to);
            },
            onBlockRemove: (block: Block, index: number) => {
                let outPos = new Vec2();
                data.grid.setGridIDToPos(new Vec2(block.blockGridID.x, data.grid.rows + index + 1), outPos);
                block.x = outPos.x;
                block.y = data.grid.blockSize + data.grid.gridSize.height / 2;
                block.type = data.grid.randomBlockType();
                this.fillNewNode(block);
                musicMgr.ins.playSound('drop');
            },
            isNeedRemove: (block: Block) => {
                return block.isValid() && block.blockNode === null;
            }
        });

        this.checkAndMoveBlock(data);
    }

    private checkAndMoveBlock(data: BlockFillEnterData): void {
        let needMoveCount = 0;
        let haveMovedCount = 0;

        let vec2Temp = new Vec2(0);
        data.grid.rangeBlocks((block: Block, i: number, j: number) => {
            if (block.blockNode) {
                data.grid.setGridIDToPos(block.blockGridID, vec2Temp);
                if (block.x !== vec2Temp.x || block.y !== vec2Temp.y) {
                    needMoveCount++;
                }
            }

        });
        if (needMoveCount === 0) {
            let data = {} as IStateEnterData;
            this.state.toState(GameStateMgr.ins.blockErr, data);
            return;
        }

        data.grid.rangeBlocks((block: Block, i: number, j: number) => {
            if (block.blockNode) {
                data.grid.setGridIDToPos(block.blockGridID, vec2Temp);
                if (block.x !== vec2Temp.x || block.y !== vec2Temp.y) {
                    block.x = vec2Temp.x;
                    block.y = vec2Temp.y;
                    let blockScript = block.blockNode.getComponent(BlockComponent);
                    blockScript.setPosition(block.x, block.y, true, () => {
                        haveMovedCount++;
                        if (haveMovedCount === needMoveCount) {
                            let findData = { grid: data.grid } as BlockFindEnterData;
                            this.state.toState(GameStateMgr.ins.blockFind, findData);
                        }
                        blockScript.playScaleAnimation();
                    });
                }
            }
        });
    }
    onStateLeave(): void {
    }

    private checkToGenerateTools(data: BlockFillEnterData) {
        if (!this._gamePanel.getIsFirstStable()) {
            return;
        }
        if (data.matches.length > 0) {
            for (const matchesItem of data.matches) {
                let rowIndexSameCounter = 0;
                let colIndexSameCounter = 0;
                const firstGridID = matchesItem[0].blockGridID;
                for (const m of matchesItem) {
                    if (m.blockGridID.x === firstGridID.x) {
                        rowIndexSameCounter++;
                    }
                    if (m.blockGridID.y === firstGridID.y) {
                        colIndexSameCounter++;
                    }
                }

                let block = matchesItem[0];
                if (data.swapBlockFrom && data.swapBlockTo) {
                    for (const matchesItemTemp of matchesItem) {
                        if (matchesItemTemp.blockGridID === data.swapBlockFrom.blockGridID) {
                            block = data.swapBlockFrom;
                            break;
                        }
                        if (matchesItemTemp.blockGridID === data.swapBlockTo.blockGridID) {
                            block = data.swapBlockTo;
                            break;
                        }
                    }
                }
                if (rowIndexSameCounter === matchesItem.length || colIndexSameCounter === matchesItem.length) {
                    if (rowIndexSameCounter === 4) {
                        this.fillWithTool(block, new RowTool());
                    } else if (colIndexSameCounter === 4) {
                        this.fillWithTool(block, new ColTool());
                    }
                    else if (rowIndexSameCounter >= 5 || colIndexSameCounter >= 5) {
                        this.fillWithTool(block, new TypeTool());
                    }
                } else {
                    this.fillWithTool(block, new BoomInGridTool())
                }
            }
        }
    }
    public fillWithTool(block: Block, tool: ITool) {
        block.tool = tool;
        this.fillNewNode(block);
        musicMgr.ins.playSound('drop');
        if (GuideMgr.ins.checkGuide(GuideType.Force_Level_2_Eliminate)) {
            qc.eventManager.emit(EventDef.HideGuide, GuideType.Force_Level_2_Eliminate);
        }
        if (GuideMgr.ins.checkGuide(GuideType.Force_Level_3_Eliminate)) {
            qc.eventManager.emit(EventDef.HideGuide, GuideType.Force_Level_3_Eliminate);
        }
    }

    public setWithTool(block: Block, tool: ITool) {
        block.tool = tool;
    }
}