import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;
import { strengthApi, ExchangeList } from "../../api/exchange";
import { qc } from "../../framework/qc";
import { PanelConfigs } from "../../configs/PanelConfigs";
import PlayerMgr from "../../manager/PlayerMgr";
import GetItemMgr from '../../manager/GetItemMgr';
import { ItemType } from "../../configs/ItemConfig";
import EventDef from '../../constants/EventDef';

@ccclass('contentItems')
export class contentItems extends Component {
    @property(Label)
    title: Label = null;
    @property(Label)
    content: Label = null;
    @property(Node)
    btnNode: Node = null;

    private _task: ExchangeList = null;

    public initData(list: ExchangeList) {
        this._task = list;
        this.title.string = `${list.title}(${list.done}/${list.need})`;
        this.content.string = `+${list.reward_strength}体力`;
        console.log('this.btnNode:', this.btnNode);
        if (list.status === 0) {
            this.btnNode.getChildByName('btnLabel').getComponent(Label).string = '去完成';
        } else if (list.status === 1) {
            this.btnNode.getChildByName('redDot').active = true;
            this.btnNode.getChildByName('btnLabel').getComponent(Label).string = '领取';
        }
    }

    // 去完成---领取
    async handleComplete() {
        if (this._task.status === 0) { // 未完成
            qc.panelRouter.hide({
                panel: PanelConfigs.exchangePanel
            })
            if (this._task.type === 1) { // 任务中心
                qc.panelRouter.showPanel({
                    panel: PanelConfigs.taskPanel
                });
            } else if (this._task.type === 2) { // 做游戏

            }
        } else if (this._task.status === 1) { // 待领取
            await strengthApi.ins.strengthTaskClaim(this._task.count, res => {
                PlayerMgr.ins.addEnergy(Number(this._task.reward_strength));
                qc.eventManager.emit(EventDef.Update_RewardCount);
                GetItemMgr.ins.showGetItem(ItemType.Energy, this._task.reward_strength);
                qc.eventManager.emit(EventDef.Update_ExchangeList);
            })
            await PlayerMgr.ins.getHomeData();
            PlayerMgr.ins.getEnergy();
        }
    }
}


