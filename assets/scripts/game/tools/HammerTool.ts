import { Animation, Node } from "cc";
import { BundleConfigs } from "../../configs/BundleConfigs";
import PoolMgr from "../../manager/PoolMgr";
import { BlockToolEnterData } from "../state/BlockToolState";
import { musicMgr } from "../../manager/musicMgr";
import { qc } from "../../framework/qc";
import EventDef from "../../constants/EventDef";
import GuideMgr, { GuideType } from "../../manager/GuideMgr";
import { ITool, ToolType } from "../GameConstant";

/**
 * 任意消除一个
 */
export class HammerTool implements ITool {
    getToolType(): ToolType {
        return ToolType.Hammer;
    }
    useTool(data: BlockToolEnterData, onComplete: Function) {
        if (data.block) {
            data.block.match = true;
            let blockNode = data.block.blockNode;
            PoolMgr.ins.getNodeFromPool(BundleConfigs.gameBundle, 'prefabs/HammerEffect', (hammer: Node) => {
                hammer.parent = blockNode.parent;
                hammer.setPosition(blockNode.position);
                let ani = hammer.getComponent(Animation);
                if (ani) {
                    ani.once(Animation.EventType.FINISHED, () => {
                        PoolMgr.ins.putNodeToPool(hammer);
                    });
                    ani.play();
                    setTimeout(() => {
                        musicMgr.ins.playSound('hammer');
                    }, (14 / 30) * 1000);
                    setTimeout(() => {
                        onComplete();
                        if (GuideMgr.ins.checkGuide(GuideType.Force_Level_1_Select_Boom)) {
                            qc.eventManager.emit(EventDef.SelectBoomGuide);
                        }
                    }, (20 / 30) * 1000);
                }
            });
        }
        else {
            onComplete();
        }
    }
}