import EventDef from "../../constants/EventDef";
import { BlockComponent } from "../../custom/gamepanel/BlockComponent";
import { qc } from "../../framework/qc";
import GuideMgr, { GuideType } from "../../manager/GuideMgr";
import { Block } from "../Block";
import { GameConstant, ITool, ToolType } from "../GameConstant";
import { BlockToolEnterData } from "../state/BlockToolState";

/**
 * 列消除
 */
export class ColTool implements ITool {
    getToolType(): ToolType {
        return ToolType.Col;
    }
    useTool(data: BlockToolEnterData, onComplete: Function) {
        if (GuideMgr.ins.checkGuide(GuideType.Force_Level_2_Use_ColMatch)) {
            qc.eventManager.emit(EventDef.HideGuide, GuideType.Force_Level_2_Use_ColMatch);
        }
        let colSideBlocks: Block[] = [];
        let rowSideBlocks: Block[] = [];
        if (data.swapBlock && data.swapBlock.tool && data.swapBlock.tool.getToolType() === ToolType.Col) {
            data.grid.rangeBlocks((c: Block, i: number, j: number) => {
                if (c.blockGridID.x === data.block.blockGridID.x
                    || c.blockGridID.x === data.block.blockGridID.x - 1
                    || c.blockGridID.x === data.block.blockGridID.x + 1) {
                    if (c.blockGridID.y === data.block.blockGridID.y) {
                        colSideBlocks.push(c);
                    }
                    c.match = true;
                }
            });
        }
        else if (data.swapBlock && data.swapBlock.tool && data.swapBlock.tool.getToolType() === ToolType.Row) {
            data.grid.rangeBlocks((c: Block, i: number, j: number) => {
                if (c.blockGridID.x === data.block.blockGridID.x
                    || c.blockGridID.x === data.block.blockGridID.x - 1
                    || c.blockGridID.x === data.block.blockGridID.x + 1) {
                    if (c.blockGridID.y === data.block.blockGridID.y) {
                        colSideBlocks.push(c);
                    }
                    c.match = true;
                }
                if (c.blockGridID.y === data.swapBlock.blockGridID.y
                    || c.blockGridID.y === data.swapBlock.blockGridID.y - 1
                    || c.blockGridID.y === data.swapBlock.blockGridID.y + 1) {
                    if (c.blockGridID.x === data.block.blockGridID.x) {
                        rowSideBlocks.push(c);
                    }
                    c.match = true;
                }
            });
        }
        else if (data.swapBlock && data.swapBlock.tool && data.swapBlock.tool.getToolType() === ToolType.TypeMatch) {
            let triggerData = {
                block: data.swapBlock,
                tool: data.swapBlock.tool,
                grid: data.grid,
                swapBlock: data.block,
            } as BlockToolEnterData;
            qc.eventManager.emit(EventDef.Trigger_Tool, triggerData);
            return;
        }
        else {
            data.grid.rangeBlocks((c: Block, i: number, j: number) => {
                if (c.blockGridID.x === data.block.blockGridID.x) {
                    c.match = true;
                }
            });
        }

        let blockScript = data.block.blockNode.getComponent(BlockComponent);
        if (blockScript) {
            blockScript.activeBgLight();
            blockScript.playColMatchAnimation(() => {
                blockScript.hideBgLight();
            });
            setTimeout(() => {
                blockScript.colLineLightAni(() => {
                    onComplete();
                });
            }, GameConstant.LineLightDelayTime);

            if (colSideBlocks.length > 0) {
                for (let block of colSideBlocks) {
                    let blockScript = block.blockNode.getComponent(BlockComponent);
                    if (blockScript) {
                        blockScript.activeBgLight();
                        blockScript.playColMatchAnimation(() => {
                            blockScript.hideBgLight();
                        });
                        setTimeout(() => {
                            blockScript.colLineLightAni(null);
                        }, GameConstant.LineLightDelayTime);
                    }
                }
            }
            if (rowSideBlocks.length > 0) {
                for (let block of rowSideBlocks) {
                    let blockScript = block.blockNode.getComponent(BlockComponent);
                    if (blockScript) {
                        blockScript.activeBgLight();
                        blockScript.playRowMatchAnimation(() => {
                            blockScript.hideBgLight();
                        });
                        setTimeout(() => {
                            blockScript.rowLineLightAni(null);
                        }, GameConstant.LineLightDelayTime);
                    }
                }
            }
        }
        else {
            onComplete();
        }
    }
}