import { _decorator, Component, Label, Node, Sprite } from 'cc';
import CocosUtils from '../../utils/CocosUtils';
import { BundleConfigs } from '../../configs/BundleConfigs';
import { LuckyTurntableConfig } from '../../configs/LuckyTurntableConfig';
import ConfigMgr from '../../manager/ConfigMgr';
import { ItemConfig } from '../../configs/ItemConfig';
import { configConfigs } from '../../configs/configConfigs';
const { ccclass, property } = _decorator;

@ccclass('LuckyRewardItem')
export class LuckyRewardItem extends Component {
    @property(Sprite)
    icon: Sprite = null;
    @property(Label)
    num: Label = null;
    @property(Node)
    noneNode: Node = null;

    public init(data: LuckyTurntableConfig) {
        this.icon.node.active = data.itemtype != -1;
        this.noneNode.active = data.itemtype == -1;
        if (data.itemtype != -1) {
            let item = ConfigMgr.ins.getConfig<ItemConfig>(configConfigs.itemConfig, data.itemtype);
            if (item) {
                CocosUtils.loadTextureFromBundle(BundleConfigs.iconBundle, item.icon, this.icon);
            }
            this.num.string = data.num.toString();
        }
    }
}


