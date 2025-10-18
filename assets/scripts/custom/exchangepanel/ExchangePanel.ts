import { _decorator, Node, Label } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from "../../framework/lib/router/PanelComponent";
import { qc } from "../../framework/qc";
import { PanelConfigs } from "../../configs/PanelConfigs";
import { contentItems } from './ExchangeItems';
import ListCom from '../../framework/lib/components/scrollviewplus/ListCom';
const { ccclass, property } = _decorator;
import { strengthApi } from '../../api/exchange';
import EventDef from "../../constants/EventDef";
import PlayerMgr from '../../manager/PlayerMgr';
import { rewardedVideoAd } from "../../framework/lib/platform/platform_interface";
import { baseConfig } from "../../configs/baseConfig";
import { ItemType } from "../../configs/ItemConfig";
import GetItemMgr from "../../manager/GetItemMgr";
import CommonTipsMgr from "db://assets/scripts/manager/CommonTipsMgr";

@ccclass('ExchangePanel')
export class ExchangePanel extends PanelComponent {
    @property(ListCom)
    list: ListCom = null;
    @property(Label)
    count: Label = null;
    @property(Label)
    title: Label = null;
    @property(Label)
    btnLabel: Label = null;
    @property(Node)
    noDtaNode: Node = null;
    time: any = null

    private _initList() {
        this.noDtaNode.active = strengthApi.ins.taskList.length === 0;
        this.list.numItems = !strengthApi.ins.taskList ? 0 : strengthApi.ins.taskList.length;
    }

    init() {
        this.count.string = `x${PlayerMgr.ins.userInfo.props.strength.toString()}`;
        strengthApi.ins.getStrengthTasks((res) => {
            this._initList();
            const oData = res.strength_video;
            if (oData.done === oData.limit) {
                this.btnLabel.string = '已达上限';
            } else {
                this.btnLabel.string = '立即获得';
            }
        })
        if (PlayerMgr.ins.userInfo.props.strength >= 100) {
            this.title.node.parent.active = false;
        } else {
            this.title.node.parent.active = true;
        }


    }
    clearTIME(time: number) {
        this.title.string = `${this.formatTimestampToMMSS(time)}后+1`;
        this.title.node.parent.active = PlayerMgr.ins.userInfo.props.strength < 100;
    }
    private formatTimestampToMMSS(timestamp: number): string {
        // 转换为秒
        const totalSeconds = Math.floor(timestamp / 1000);

        // 计算分钟和秒数
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        // 使用三元运算符处理前导零
        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    private _updateList() {
        strengthApi.ins.getStrengthTasks(() => {
            this.list.numItems = 0;
            this._initList();
        });
    }

    onRenderRenwuItem(item: Node, index: number) {
        item.active = true;
        let taskItem = item.getComponent(contentItems);
        if (taskItem) {
            taskItem.initData(strengthApi.ins.taskList[index]);
        }
    }

    _onshow(res) {
        // this.init();
    }

    _updateCount() {
        this.count.string = `x${PlayerMgr.ins.userInfo.props.strength.toString()}`;
    }

    protected onEnable(): void {
        qc.eventManager.on(EventDef.OnShow, this._onshow, this);
        qc.eventManager.on(EventDef.Update_ExchangeList, this._updateList, this);
        qc.eventManager.on(EventDef.Update_RewardCount, this._updateCount, this);
        qc.eventManager.on(EventDef.Close_Strength_Timer, this.clearTIME, this)
        // this.init();
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.OnShow, this._onshow, this);
        qc.eventManager.off(EventDef.Update_ExchangeList, this._updateList, this);
        qc.eventManager.off(EventDef.Update_RewardCount, this._updateCount, this);
        qc.eventManager.off(EventDef.Close_Strength_Timer, this.clearTIME, this)
    }

    // 关闭弹框
    handleClosePop() {
        qc.panelRouter.hide({
            panel: PanelConfigs.exchangePanel
        })
    }

    // 观看视频领取体力
    handleWatchVideo() {
        let ad: rewardedVideoAd = {
            adUnitId: baseConfig.adUnitIds[0],
            successCb: (res) => {
                
            },
            failCb: (res) => {
                if (res.isCompleted) {
                    strengthApi.ins.strengthClaim((data) => {
                        const count = Number(data.strength) - Number(PlayerMgr.ins.userInfo.props.strength)
                        PlayerMgr.ins.addEnergy(count);
                        GetItemMgr.ins.showGetItem(ItemType.Energy, count);
                        qc.eventManager.emit(EventDef.Update_RewardCount);
                        if (data.done === 3) {
                            this.btnLabel.string = '已达上限';
                        } else {
                            this.btnLabel.string = '立即获得';
                        }
                    });
                } else {
                    CommonTipsMgr.ins.showTips('未完成广告浏览');
                }
            },
        }
        qc.platform.showRewardedAd(ad);
    }

    show(option: PanelShowOption): void {
        option.onShowed();
        this.init();
    }

    hide(option: PanelHideOption): void {
        option.onHided();
    }
}


