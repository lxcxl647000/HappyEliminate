import { _decorator, Component, EditBox, instantiate, Label, Node, ScrollView, UITransform } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import CustomSprite from '../componetUtils/CustomSprite';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import CashMgr, { ICashData } from '../../manager/CashMgr';
import { CashItem } from './CashItem';
import EventDef from '../../constants/EventDef';
import CocosUtils from '../../utils/CocosUtils';
import ListCom from '../../framework/lib/components/scrollviewplus/ListCom';
import CommonTipsMgr from '../../manager/CommonTipsMgr';
import PlayerMgr from '../../manager/PlayerMgr';
const { ccclass, property } = _decorator;

enum CashPanelTipsType {
    CashRule,
    CashFail
}

@ccclass('CashPanel')
export class CashPanel extends PanelComponent {
    @property(Label)
    cashLabel: Label = null;
    @property(Node)
    selectCashList: Node = null;
    @property(EditBox)
    accountEdit: EditBox = null;
    @property(EditBox)
    accountNameEdit: EditBox = null;
    @property(Node)
    tipsNode: Node = null;
    @property(CustomSprite)
    tipsTitle: CustomSprite = null;
    @property(Node)
    cashRuleNode: Node = null;
    @property(Node)
    cashFailNode: Node = null;
    @property(ScrollView)
    scroll: ScrollView = null;
    @property(Node)
    cashItemNode: Node = null;
    @property(Node)
    conditionNode: Node = null;
    @property(ListCom)
    conditionList: ListCom = null;
    @property(Node)
    maskNode: Node = null;

    private _unlockCondition: string[] = null;
    private _curSelectCash: ICashData = null;

    show(option: PanelShowOption): void {
        option.onShowed();

        this._init();
        qc.eventManager.emit(EventDef.Close_Loading);
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    onEnable() {
        qc.eventManager.on(EventDef.Show_Cash_Unlock_Condition, this._showUnlockCondition, this);
        qc.eventManager.on(EventDef.Select_Cash, this._selectCash, this);
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.Show_Cash_Unlock_Condition, this._showUnlockCondition, this);
        qc.eventManager.off(EventDef.Select_Cash, this._selectCash, this);
    }

    private _showUnlockCondition(targetNode: Node, unlockCondition: string[]) {
        this.conditionNode.active = true;
        this.conditionList.numItems = 0;
        let pos = CocosUtils.setNodeToTargetPos(this.conditionNode, targetNode);
        pos.y += this.conditionNode.getComponent(UITransform).height;
        this.conditionNode.setPosition(pos.x, pos.y, pos.z);
        this._unlockCondition = unlockCondition;
        this.conditionList.numItems = unlockCondition.length;
        this.maskNode.active = true;
    }

    private _selectCash(data: ICashData) {
        this._curSelectCash = data;
    }

    onRenderCondition(item: Node, index) {
        item.active = true;
        item.getComponent(Label).string = `${index + 1}. ${this._unlockCondition[index]}`;
    }

    private _init() {
        this.cashLabel.string = PlayerMgr.ins.userInfo.props.money.toFixed(2);
        this.scroll.scrollToTop();
        this._initData();
    }

    private _initData() {
        CashMgr.ins.requestCashData(() => {
            this._initSelectCashList();
            this._initDefaultAccount();
        });
    }

    onCashBtn() {
        if (!this._curSelectCash) {
            CommonTipsMgr.ins.showTips('请选择提现档位');
            return;
        }
        if (this._curSelectCash.daily_limit <= this._curSelectCash.used_today) {
            this._showTips(CashPanelTipsType.CashFail);
            return;
        }
        // let cash = CashMgr.ins.cashData;
        // if (!cash.account) {
        //     CommonTipsMgr.ins.showTips('请先保存账户');
        //     return;
        // }
        CashMgr.ins.requestCash(this._curSelectCash.amount, this.accountEdit.string, this.accountNameEdit.string, (res) => {
            if (res.data.amount) {
                PlayerMgr.ins.addCash(-res.data.amount);
                this.cashLabel.string = PlayerMgr.ins.userInfo.props.money.toFixed(2);
                CommonTipsMgr.ins.showTips('提现成功');
                this._initData();
            }
            else {
                CommonTipsMgr.ins.showTips(res.msg);
            }
        });
    }

    onSaveAccountBtn() {
        let account = this.accountEdit.string;
        let real_name = this.accountNameEdit.string;
        console.log(real_name, typeof real_name);

        CashMgr.ins.requestSaveDefaultAccount(account, real_name, () => {
            CommonTipsMgr.ins.showTips('保存成功');
            CashMgr.ins.requestCashData(null);
        });
    }

    onCloseBtn() {
        qc.panelRouter.hide({ panel: PanelConfigs.cashPanel });
    }

    onRuleBtn() {
        this._showTips(CashPanelTipsType.CashRule);
    }

    private _initSelectCashList() {
        this._curSelectCash = null;
        let cashes = CashMgr.ins.cashData.list;
        let isInit = this.selectCashList.children.length === 0;
        let index = 0;
        for (let cash of cashes) {
            let itemNode: Node = null;
            if (isInit) {
                itemNode = instantiate(this.cashItemNode);
                itemNode.parent = this.selectCashList;
            }
            else {
                itemNode = this.selectCashList.children[index];
            }
            itemNode.active = true;
            let item = itemNode.getComponent(CashItem);
            item.init(cash, index + 1);
            index++;
        }
    }

    private _initDefaultAccount() {
        let account = CashMgr.ins.cashData.account;
        if (account) {
            this.accountEdit.string = account.alipay_account;
            this.accountNameEdit.string = account.real_name;
        }
    }

    private _showTips(type: CashPanelTipsType) {
        this.tipsTitle.index = type;
        this.cashRuleNode.active = type === CashPanelTipsType.CashRule;
        this.cashFailNode.active = type === CashPanelTipsType.CashFail;
        this.tipsNode.active = true;
    }

    onHideTips() {
        this.tipsNode.active = false;
    }

    onClickMask() {
        this.conditionNode.active = false;
        this.maskNode.active = false;
    }
}


