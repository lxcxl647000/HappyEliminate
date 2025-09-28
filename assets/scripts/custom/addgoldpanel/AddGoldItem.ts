import { _decorator, Component, Label, Node, Sprite } from 'cc';
import CocosUtils from '../../utils/CocosUtils';
import { BundleConfigs } from '../../configs/BundleConfigs';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import LevelMgr from '../../game/LevelMgr';
import PlayerMgr from '../../game/PlayerMgr';
const { ccclass, property } = _decorator;


export interface AddGoldData {
    id: number;
    des: string;
    icon: string;
    btnLabel: string;
}

@ccclass('AddGoldItem')
export class AddGoldItem extends Component {
    @property(Label)
    btnLabel: Label = null!
    @property(Sprite)
    icon: Sprite = null!
    @property(Label)
    des: Label = null!

    private _data: AddGoldData = null!

    public init(data: AddGoldData) {
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
                let currentLevel = LevelMgr.ins.getLevel(PlayerMgr.ins.player.mapId, PlayerMgr.ins.player.level);
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


