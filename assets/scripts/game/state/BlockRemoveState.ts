import EventDef from "../../constants/EventDef";
import { qc } from "../../framework/qc";
import GuideMgr, { GuideType } from "../../manager/GuideMgr";
import { musicMgr } from "../../manager/musicMgr";
import { GameGrid } from "../GameGrid";
import { IStateEnterData, IState, BlockState } from "./BlockStateBase";
import { BlockFillState, BlockFillEnterData } from "./BlockFillState";
import GameStateMgr from "./GameStateMgr";
import { Block } from "../Block";
import { BlockComponent } from "../../custom/gamepanel/BlockComponent";

export class BlockRemoveEnterData extends IStateEnterData {
    matches: Block[][];
    toolMatches: Block[];
    grid: GameGrid;
    swapBlockFrom?: Block;
    swapBlockTo?: Block;
}

export class BlockRemoveState extends BlockState {
    checkToState(state: IState): boolean {
        return state instanceof BlockFillState;
    }
    onStateEnter(data: BlockRemoveEnterData): void {
        let grid = data.grid;
        let needRemoveCount = 0;
        let hadRemovedCount = 0;
        grid.rangeBlocks((block: Block, i: number, j: number) => {
            if (block.match && block.blockNode) {
                needRemoveCount++;
            }
        });
        grid.rangeBlocks((block: Block, i: number, j: number) => {
            if (block.match && block.blockNode) {
                let blockScript = block.blockNode.getComponent(BlockComponent);
                block.blockNode = null;
                blockScript.disappear(() => {
                    hadRemovedCount++;
                    if (hadRemovedCount === needRemoveCount) {
                        if (GuideMgr.ins.checkGuide(GuideType.Force_Level_1_Eliminate)) {
                            qc.eventManager.emit(EventDef.HideGuide, GuideType.Force_Level_1_Eliminate);
                        }
                        musicMgr.ins.playSound('score');
                        if (needRemoveCount >= 4) {
                            qc.platform.vibrateShort();
                        }
                        let fillData = { matches: data.matches, grid: data.grid, swapBlockFrom: data.swapBlockFrom, swapBlockTo: data.swapBlockTo } as BlockFillEnterData;
                        this.state.toState(GameStateMgr.ins.blockFill, fillData);
                    }
                });
            }
            block.match = false;
        });
    }

    onStateLeave(): void {

    }
}