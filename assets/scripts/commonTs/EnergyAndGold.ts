import { _decorator, CCBoolean, Component, Node } from 'cc';
import CustomSprite from '../custom/componetUtils/CustomSprite';
import { qc } from '../framework/qc';
import EventDef from '../constants/EventDef';
import { numAnimaTs } from './numAnimaTs';
import PlayerMgr from '../manager/PlayerMgr';
const { ccclass, property } = _decorator;

@ccclass('EnergyAndGold')
export class EnergyAndGold extends Component {
    @property(CCBoolean)
    isGold: boolean = true;
    @property(CustomSprite)
    icon: CustomSprite = null;
    @property(numAnimaTs)
    numLabel: numAnimaTs = null;

    onEnable() {
        let num = 0;
        if (this.isGold) {
            this.icon.index = 0;
            qc.eventManager.on(EventDef.Update_Gold, this._updateGold, this);
            num = PlayerMgr.ins.userInfo.props.integral;
        }
        else {
            this.icon.index = 1;
            qc.eventManager.on(EventDef.Update_Energy, this._updateEnergy, this);
            num = PlayerMgr.ins.userInfo.props.strength;
        }
        this.numLabel.init(num);
    }

    protected onDisable(): void {
        if (this.isGold) {
            qc.eventManager.off(EventDef.Update_Gold, this._updateGold, this);
        }
        else {
            qc.eventManager.off(EventDef.Update_Energy, this._updateEnergy, this);
        }
    }

    private _updateGold() {
        this.numLabel.numAnima(PlayerMgr.ins.userInfo.props.integral);
    }

    private _updateEnergy() {
        this.numLabel.numAnima(PlayerMgr.ins.userInfo.props.strength);
    }
}


