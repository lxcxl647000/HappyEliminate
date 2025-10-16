import { _decorator, Component, EditBox, Node } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { Constants } from '../../game/Constants';
import PlayerMgr from '../../manager/PlayerMgr';
import { PanelConfigs } from '../../configs/PanelConfigs';
import GetItemMgr from '../../manager/GetItemMgr';
const { ccclass, property } = _decorator;

@ccclass('GMPanel')
export class GMPanel extends PanelComponent {
    @property(EditBox)
    itemInput: EditBox = null;
    @property(EditBox)
    levelInput: EditBox = null;

    show(option: PanelShowOption): void {
        option.onShowed();
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    onClose() {
        qc.panelRouter.hide({ panel: PanelConfigs.gmPanel });
    }

    onClearAllData() {
        // qc.storage.setObj(Constants.PLAYER_DATA_KEY, {});
    }

    onAddItem() {
        let str = this.itemInput.textLabel.string;
        let strArr = str.split('|');
        let num = +strArr[0];
        let type = +strArr[1];
        if (isNaN(num) || isNaN(type)) return;
        GetItemMgr.ins.showGetItem(+type, +num, true);
    }

    onLevel() {
        // let str = this.levelInput.textLabel.string;
        // if (isNaN(+str)) return;
        // let level = +str;
        // let curLevel = PlayerMgr.ins.player.level;
        // if (level < curLevel) return;
        // curLevel++;
        // for (let i = curLevel; i <= level; i++) {
        //     PlayerMgr.ins.player.stars[i] = 3;
        // }
        // PlayerMgr.ins.player.level = level + 1;
        // qc.storage.setObj(Constants.PLAYER_DATA_KEY, PlayerMgr.ins.player);
    }

    onClearLuckyTurntable() {
        qc.storage.setObj(Constants.LUCKY_TURNTABLE_DATA_KEY, { time: 0, count: 0 });

    }
}


