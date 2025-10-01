import { Node } from "cc";
import PoolMgr from "./PoolMgr";
import { BundleConfigs } from "../configs/BundleConfigs";
import { CommonTips } from "../commonTs/CommonTips";
import { qc } from "../framework/qc";

export default class CommonTipsMgr {
    private static _ins: CommonTipsMgr = null;
    public static get ins() {
        if (this._ins == null) {
            this._ins = new CommonTipsMgr();
        }
        return this._ins;
    }

    public showTips(tips: string) {
        PoolMgr.ins.getNodeFromPool(BundleConfigs.commonBundle, 'prefabs/commonTips', (node: Node) => {
            if (node) {
                node.parent = qc.panelRouter.rootNode;
                node.setPosition(0, 0, 0);
                node.getComponent(CommonTips).setTips(tips);
            }
        });
    }
}