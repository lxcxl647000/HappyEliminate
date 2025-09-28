import { _decorator, Component, Label, Node } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import { Level } from '../../game/Level';
import { GoalTypeCounter, GoalValue } from '../../game/goal/GoalTyps';
import CustomSprite from '../componetUtils/CustomSprite';
import PlayerMgr from '../../game/PlayerMgr';
import { ToolType } from '../../game/tools/ITool';
import { ItemType } from '../../configs/ItemConfig';
import EventDef from '../../constants/EventDef';
import { Constants } from '../../game/Constants';
import { SelectTool } from './SelectTool';
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

    private _level: Level = null;
    private _tools: ItemType[] = [ItemType.Boom, ItemType.Steps];
    private _selectTools: { [id: number]: number } = {};

    show(option: PanelShowOption): void {
        option.onShowed();
        this._selectTools = {};
        this._level = option.data as Level;

        this._init();
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    protected onEnable(): void {
        qc.eventManager.on(EventDef.Select_Tool, this._updateSelectTool, this);
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.Select_Tool, this._updateSelectTool, this);
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
            select.init(tool, num);
        }
    }

    onCloseClick() {
        this._hidePanel();
    }

    private _hidePanel() {
        qc.panelRouter.hide({
            panel: PanelConfigs.gameStartPanel
        });
    }

    onStartClick() {
        if (PlayerMgr.ins.player.energy < Constants.Energy_Cost) {
            return;
        }
        PlayerMgr.ins.addEnergy(-Constants.Energy_Cost);
        qc.panelRouter.showPanel({
            panel: PanelConfigs.gamePanel,
            onShowed: () => {

            },
            data: { level: this._level, selectTools: this._selectTools }
        });
        this._hidePanel();
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
        // test//
        PlayerMgr.ins.addItem(ItemType.Boom, 1);
        PlayerMgr.ins.addItem(ItemType.Steps, 1);
        qc.storage.setObj(Constants.PLAYER_DATA_KEY, PlayerMgr.ins.player);
        this._initTools();
        // test// 

    }
}


