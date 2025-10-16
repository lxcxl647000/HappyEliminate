import { _decorator, Component, Label, Node } from 'cc';
import CustomSprite from '../componetUtils/CustomSprite';
import { ICashData } from '../../manager/CashMgr';
import CommonTipsMgr from '../../manager/CommonTipsMgr';
import { qc } from '../../framework/qc';
import EventDef from '../../constants/EventDef';
import ConfigMgr from '../../manager/ConfigMgr';
import { CashConfig } from '../../configs/CashConfig';
import { configConfigs } from '../../configs/configConfigs';
const { ccclass, property } = _decorator;

@ccclass('CashItem')
export class CashItem extends Component {
    @property(Node)
    lockNode: Node = null!;
    @property(Node)
    flagNode: Node = null!;
    @property(Label)
    cashLabel: Label = null!;
    @property(Label)
    des: Label = null!;
    @property(CustomSprite)
    bg: CustomSprite = null!;
    @property(Node)
    checkBtn: Node = null!;

    private _data: ICashData = null;
    private _config: CashConfig = null;

    public init(data: ICashData, id: number) {
        this.bg.index = 0;
        qc.eventManager.off(EventDef.Select_Cash, this._updateBgStatus, this);
        qc.eventManager.on(EventDef.Select_Cash, this._updateBgStatus, this);
        this._data = data;
        this.checkBtn.active = this.lockNode.active = data.unlocked === 0;
        this.cashLabel.string = `${data.amount}元`;
        this._config = ConfigMgr.ins.getConfig<CashConfig>(configConfigs.cashConfig, id);
        if (this._config) {
            let isOneCondition = this._config.unlock_condition.length === 1;
            this.des.string = isOneCondition ? this._config.unlock_condition[0] : '查看解锁条件';
            this.flagNode.active = !isOneCondition;
        }
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.Select_Cash, this._updateBgStatus, this);
    }

    private _updateBgStatus(data: ICashData) {
        this.bg.index = data === null ? 0 : (data.amount === this._data.amount ? 1 : 0);
    }

    onClickItem() {
        if (this._data.unlocked === 0) {
            CommonTipsMgr.ins.showTips('未解锁');
            return;
        }

        let isSelect = this.bg.index === 1;
        qc.eventManager.emit(EventDef.Select_Cash, isSelect ? null : this._data);
    }

    onCheckCondition() {
        if (this._config && this._config.unlock_condition.length > 1) {
            qc.eventManager.emit(EventDef.Show_Cash_Unlock_Condition, this.node, this._config.unlock_condition);
        }
    }
}


