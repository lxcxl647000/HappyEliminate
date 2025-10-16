import { _decorator, Component, Label, Node, Sprite } from 'cc';
import CocosUtils from '../../utils/CocosUtils';
import { BundleConfigs } from '../../configs/BundleConfigs';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import LevelMgr from '../../manager/LevelMgr';
import PlayerMgr from '../../manager/PlayerMgr';
import { GetGoldConfig } from '../../configs/GetGoldConfig';
const { ccclass, property } = _decorator;

@ccclass('AddGoldItem')
export class AddGoldItem extends Component {
    @property(Label)
    btnLabel: Label = null!
    @property(Sprite)
    icon: Sprite = null!
    @property(Label)
    des: Label = null!

    private _data: GetGoldConfig = null!

    public init(data: GetGoldConfig) {
        this._data = data;
        this.btnLabel.string = data.btnLabel;
        this.des.string = data.des;
        CocosUtils.loadTextureFromBundle(BundleConfigs.addGoldBundle, data.icon, this.icon);
    }

    onClickGo() {
        switch (this._data.id) {
            case 1:
                qc.panelRouter.showPanel({ panel: PanelConfigs.taskPanel });
                break;

            case 2:
                let currentLevel = LevelMgr.ins.getLevel(PlayerMgr.ins.userInfo.summary.map_on, PlayerMgr.ins.userInfo.summary.latest_passed_level + 1);
                qc.panelRouter.showPanel({
                    panel: PanelConfigs.gameStartPanel,
                    onShowed: () => {

                    },
                    data: currentLevel
                });
                break;
        }
        qc.panelRouter.hide({ panel: PanelConfigs.addGoldPanel });
    }
}


