import { _decorator, Component, Node } from 'cc';
import { qc } from '../framework/qc';
import EventDef from '../constants/EventDef';
import { numAnimaTs } from './numAnimaTs';
import PlayerMgr from '../manager/PlayerMgr';
const { ccclass, property } = _decorator;

@ccclass('Cash')
export class Cash extends Component {
    @property(numAnimaTs)
    numLabel: numAnimaTs = null;

    onEnable() {
        qc.eventManager.on(EventDef.Update_Cash, this._updateCash, this);
        let num = PlayerMgr.ins.userInfo.props.money;
        this.numLabel.init(num);
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.Update_Cash, this._updateCash, this);
    }

    private _updateCash() {
        this.numLabel.numAnima(PlayerMgr.ins.userInfo.props.money);
    }
}


