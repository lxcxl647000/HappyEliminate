import { Vec2 } from "cc";
import { BlockToolEnterData } from "../state/BlockToolState";
import { GameConstant, ITool, ToolType } from "../GameConstant";
import { musicMgr } from "../../manager/musicMgr";
import GuideMgr, { GuideType } from "../../manager/GuideMgr";
import { qc } from "../../framework/qc";
import EventDef from "../../constants/EventDef";
import { Block } from "../Block";
import { BlockComponent } from "../../custom/gamepanel/BlockComponent";

export class BoomInGridTool implements ITool {
    getToolType(): ToolType {
        return ToolType.BoomInGrid;
    }
    useTool(data: BlockToolEnterData, onComplete: Function) {
        if (GuideMgr.ins.checkGuide(GuideType.Force_Level_3_Use_Boom)) {
            qc.eventManager.emit(EventDef.HideGuide, GuideType.Force_Level_3_Use_Boom);
        }
        if (data.swapBlock && data.swapBlock.tool && data.swapBlock.tool.getToolType() === ToolType.BoomInGrid) {
            let x1 = data.block.blockGridID.x - 2;
            let x2 = data.block.blockGridID.x + 2;
            let y1 = data.block.blockGridID.y - 2;
            let y2 = data.block.blockGridID.y + 2;
            data.grid.rangeBlocks((c: Block, i: number, j: number) => {
                if (c.blockGridID.x >= x1 && c.blockGridID.x <= x2 && c.blockGridID.y >= y1 && c.blockGridID.y <= y2) {
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
                const dis = Vec2.distance(data.block.blockGridID, c.blockGridID);
                if (dis < 2) {
                    c.match = true;
                }
            });
        }

        let blockScript = data.block.blockNode.getComponent(BlockComponent);
        if (blockScript) {
            blockScript.activeBgLight();
            blockScript.playBoomMatchAnimation(() => {
                blockScript.hideBgLight();
            });
            setTimeout(() => {
                musicMgr.ins.playSound('bomb');
                blockScript.boomLightAni(() => {
                    onComplete();
                });
            }, GameConstant.BoomLightDelayTime);
        }
        else {
            onComplete();
        }
    }
}