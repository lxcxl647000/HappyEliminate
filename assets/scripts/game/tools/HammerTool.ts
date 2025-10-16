import { Animation, Node } from "cc";
import { BundleConfigs } from "../../configs/BundleConfigs";
import PoolMgr from "../../manager/PoolMgr";
import { ToolsStateEnterData } from "../gridstate/ToolsState";
import { ITool, ToolType } from "./ITool";
import { musicMgr } from "../../manager/musicMgr";
import { qc } from "../../framework/qc";
import EventDef from "../../constants/EventDef";
import GuideMgr, { GuideType } from "../../manager/GuideMgr";

/**
 * 任意消除一个
 */
export class HammerTool implements ITool {
    getType(): ToolType {
        return ToolType.TYPE_HAMMER;
    }
    process(data: ToolsStateEnterData, onComplete: () => void) {
        if (data.cell) {
            data.cell.match = true;
            let cellNode = data.cell.node;
            PoolMgr.ins.getNodeFromPool(BundleConfigs.gameBundle, 'prefabs/HammerEffect', (hammer: Node) => {
                hammer.parent = cellNode.parent;
                hammer.setPosition(cellNode.position);
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