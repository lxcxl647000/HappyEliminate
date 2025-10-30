import { Vec2 } from "cc";
import { BlockToolEnterData } from "../state/BlockToolState";
import { GameConstant, ITool, ToolType } from "../GameConstant";
import { musicMgr } from "../../manager/musicMgr";
import { qc } from "../../framework/qc";
import EventDef from "../../constants/EventDef";
import GuideMgr, { GuideType } from "../../manager/GuideMgr";
import { Block } from "../Block";
import { BlockComponent } from "../../custom/gamepanel/BlockComponent";

/**
 * 底部点击使用的炸弹道具
 */
export class BoomTool implements ITool {
    getToolType(): ToolType {
        return ToolType.Boom;
    }
    useTool(data: BlockToolEnterData, onComplete: Function) {
        if (!data.block) {
            data.block = data.grid.randomBlock();
        }
        data.grid.rangeBlocks((c: Block, i: number, j: number) => {
            const dis = Vec2.distance(data.block.blockGridID, c.blockGridID);
            if (dis < 2) {
                c.match = true;
            }
        });

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
                    if (GuideMgr.ins.checkGuide(GuideType.Force_Level_1_Pass_Target)) {
                        qc.eventManager.emit(EventDef.PassTargetGuide);
                    }
                });
            }, GameConstant.BoomLightDelayTime);
        }
        else {
            onComplete();
        }
    }
}