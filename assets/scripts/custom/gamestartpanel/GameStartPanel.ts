import { _decorator, Component, Label, Node } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import { LevelConfig } from '../../configs/LevelConfig';
import { GoalTypeCounter, GoalValue } from '../../game/goal/GoalTyps';
import CustomSprite from '../componetUtils/CustomSprite';
import PlayerMgr from '../../manager/PlayerMgr';
import { ToolType } from '../../game/tools/ITool';
import { ItemType } from '../../configs/ItemConfig';
import EventDef from '../../constants/EventDef';
import { Constants } from '../../game/Constants';
import { SelectTool } from './SelectTool';
import CommonTipsMgr from '../../manager/CommonTipsMgr';
import { rewardedVideoAd } from '../../framework/lib/platform/platform_interface';
import { baseConfig } from '../../configs/baseConfig';
import GetItemMgr from '../../manager/GetItemMgr';
import LevelMgr from '../../manager/LevelMgr';
import ItemMgr from '../../manager/ItemMgr';
const { ccclass, property } = _decorator;

@ccclass('GameStartPanel')
export class GameStartPanel extends PanelComponent {
    @property(Node)
    targetParent: Node = null;
    @property(Label)
    levelLabel: Label = null;
    @property(Node)
    toolParent: Node = null;
    @property(Label)
    energyCostLabel: Label = null;

    private _level: LevelConfig = null;
    private _tools: ItemType[] = [ItemType.Boom, ItemType.Steps];
    private _selectTools: { [id: number]: number } = {};
    private _cdTime: number = 0;
    private _replayCb: Function = null;
    private _closeCb: Function = null;

    show(option: PanelShowOption): void {
        option.onShowed();
        this._selectTools = {};
        this._level = option.data.levelConfig as LevelConfig;
        this._replayCb = option.data.replayCb;
        this._closeCb = option.data.closeCb;

        this._init();
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    protected update(dt: number): void {
        if (this._cdTime > 0) {
            this._cdTime -= dt;
            if (this._cdTime <= 0) this._cdTime = 0;
        }
    }

    protected onEnable(): void {
        qc.eventManager.on(EventDef.Select_Tool, this._updateSelectTool, this);
        qc.eventManager.on(EventDef.Update_Item, this._initTools, this);
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.Select_Tool, this._updateSelectTool, this);
        qc.eventManager.off(EventDef.Update_Item, this._initTools, this);
    }

    private _init() {
        this.energyCostLabel.string = `-${Constants.Energy_Cost}`;
        this.levelLabel.string = this._level.levelIndex.toString();
        this._initTarget();
        this._initTools();
    }

    private _initTarget() {
        let goal = this._level.goal as GoalValue;
        if (goal) {
            let goals = goal.value as GoalTypeCounter[];
            for (let i = 0; i < this.targetParent.children.length; i++) {
                let target = this.targetParent.children[i];
                target.active = i < goals.length;
                if (target.active) {
                    let icon = target.getComponent(CustomSprite);
                    icon.index = goals[i].cellType;
                    icon.getComponentInChildren(Label).string = goals[i].counter.toString();
                }
            }
        }
    }

    private _initTools() {
        let index = 0;
        for (let tool of this._tools) {
            let num = PlayerMgr.ins.getItemNum(tool);
            let select = this.toolParent.children[index++].getComponent(SelectTool);
            select.init(tool, num, this._level);
        }
    }

    onCloseClick() {
        this._closeCb && this._closeCb();
        this._hidePanel();
    }

    private _hidePanel() {
        qc.panelRouter.hide({
            panel: PanelConfigs.gameStartPanel
        });
        this._closeCb = null;
        this._replayCb = null;
    }

    async onStartClick() {
        if (this._cdTime > 0) return;

        this._cdTime = 1;
        if (this._replayCb) {
            this._replayCb(this._selectTools);
            this._cdTime = 0;
            this._hidePanel();
        }
        else {
            if (PlayerMgr.ins.userInfo.props.strength >= Constants.Energy_Cost) {
                await LevelMgr.ins.sendLevelToServer(this._level.levelIndex)
                await PlayerMgr.ins.getHomeData()
                PlayerMgr.ins.getEnergy()

                qc.panelRouter.showPanel({
                    panel: PanelConfigs.gamePanel,
                    onShowed: () => {

                    },
                    data: { level: this._level, selectTools: this._selectTools }
                });
                this._cdTime = 0;
                this._hidePanel();
            } else {
                CommonTipsMgr.ins.showTips('体力不足');
            }
        }
    }

    private _updateSelectTool(itemType: ItemType, num: number) {
        let toolType = ToolType.INVALID;
        if (itemType === ItemType.Boom) {
            toolType = ToolType.BOOM_MATCH;
        }
        else if (itemType === ItemType.Steps) {
            toolType = ToolType.TYPE_STEPS;
        }
        this._selectTools[toolType] = num;
    }

    onAdGetTool() {
        let ad: rewardedVideoAd = {
            adUnitId: qc.platform.getAllAdUnitIds()[0],
            successCb: () => {
                let item = ItemMgr.ins.getItem(ItemType.Boom);
                if (item) {
                    ItemMgr.ins.getItemByAd(item.type, () => {
                        PlayerMgr.ins.addItem(item.id, 1);
                        GetItemMgr.ins.showGetItem(item.id, 1);
                    });
                }
            },
            failCb: (res) => {
                CommonTipsMgr.ins.showTips('未完成广告浏览');
            }
        }
        qc.platform.showRewardedAd(ad);
    }
}


