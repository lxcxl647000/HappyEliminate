import EventDef from "../../constants/EventDef";
import { qc } from "../../framework/qc";
import { GameGrid } from "../GameGrid";
import GameStateMgr from "../state/GameStateMgr";
import { BlockToolEnterData } from "../state/BlockToolState";
import { BoomInGridTool } from "./BoomInGridTool";
import { ColTool } from "./ColTool";
import { RowTool } from "./RowTool";
import { Block } from "../Block";
import { BlockComponent } from "../../custom/gamepanel/BlockComponent";
import { ITool, ToolType } from "../GameConstant";

export class TypeTool implements ITool {
    getToolType(): ToolType {
        return ToolType.TypeMatch;
    }
    useTool(data: BlockToolEnterData, onComplete: Function) {
        let typeMatchs: Block[] = [];
        data.block.match = true;
        // 糖果和炸弹交换 随机是个变炸弹再爆炸
        if (data.swapBlock && data.swapBlock.tool && data.swapBlock.tool.getToolType() === ToolType.BoomInGrid) {
            typeMatchs = this._findRandomTools(ToolType.BoomInGrid, data.grid);
            onComplete = () => {
                qc.eventManager.emit(EventDef.Trigger_Tools, typeMatchs);
            }
        }
        // 糖果和横竖交换 随机是个变横竖再消除
        else if (data.swapBlock && data.swapBlock.tool && (data.swapBlock.tool.getToolType() === ToolType.Col || data.swapBlock.tool.getToolType() === ToolType.Row)) {
            let toolType = data.swapBlock.tool.getToolType();
            typeMatchs = this._findRandomTools(toolType, data.grid);
            onComplete = () => {
                qc.eventManager.emit(EventDef.Trigger_Tools, typeMatchs);
            }
        }
        else {
            let isClearAll = data.swapBlock && data.swapBlock.tool
                && data.swapBlock.tool.getToolType() === ToolType.TypeMatch
                && data.tool.getToolType() === ToolType.TypeMatch;
            data.grid.rangeBlocks((c: Block, i: number, j: number) => {
                if (isClearAll || (data.swapBlock && c.type === data.swapBlock.type && c.tool === null)) {
                    c.match = true;
                    typeMatchs.push(c);
                }
            });
        }

        this._playAni(typeMatchs, data.block.blockNode.getComponent(BlockComponent), onComplete);
    }

    private _playAni(typeMatchs: Block[], blockScript: BlockComponent, onComplete: Function) {
        if (blockScript) {
            setTimeout(() => {
                blockScript.playTypeMatchAnimation(null, 'candyMatch');
                for (let c of typeMatchs) {
                    let blockScript = c.blockNode.getComponent(BlockComponent);
                    if (blockScript) {
                        blockScript.playTypeMatchAnimation(null, 'candyMatch2');
                    }
                }
                blockScript.typeLightAni(() => {
                    onComplete && onComplete();
                });
            }, (5 / 30) * 1000);
        }
        else {
            onComplete && onComplete();
        }
    }

    private _findRandomTools(toolType: ToolType, grid: GameGrid) {
        let typeMatchs: Block[] = [];
        let checkBlock = (randomBlock: Block) => {
            if (randomBlock === null) {
                return true;
            }
            for (let block of typeMatchs) {
                if (block.blockGridID.x === randomBlock.blockGridID.x && block.blockGridID.y === randomBlock.blockGridID.y) {
                    return true;
                }
            }
            return false;
        }
        for (let i = 0; i < 10; i++) {
            let randomBlock: Block = null;
            while (checkBlock(randomBlock)) {
                randomBlock = grid.randomBlock();
            }
            typeMatchs.push(randomBlock);
        }

        for (let block of typeMatchs) {
            let iTool = toolType === ToolType.Col ? new ColTool() : new RowTool();
            switch (toolType) {
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
                    blockScript.setToolType(toolType);
                    GameStateMgr.ins.blockFill.setWithTool(block, iTool);
                }
            }
        }
        return typeMatchs;
    }
}