import { ItemType } from "../configs/ItemConfig";
import { PanelConfigs } from "../configs/PanelConfigs";
import { qc } from "../framework/qc";

export default class GetItemMgr {
    private static _ins: GetItemMgr = null;
    public static get ins() {
        if (this._ins == null) {
            this._ins = new GetItemMgr();
        }
        return this._ins;
    }

    public showGetItem(type: ItemType, num: number, isAdBtn?: boolean, costGold?: number, isNormal?: boolean, flyRedPack?: boolean) {
        if (type === ItemType.RedPack && qc.platform.checkNotDisplayRedPack()) {
            return;
        }
        qc.panelRouter.showPanel({ panel: PanelConfigs.getItemPanel, data: { type, num, isAdBtn, costGold, isNormal, flyRedPack } });
    }
}