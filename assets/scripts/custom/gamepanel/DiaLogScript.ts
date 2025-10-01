import { _decorator, instantiate, Label, Node, Sprite, UITransform } from 'cc';
import { StarUtils } from './StarUtils';
import { DiaLogBaseScript, IDialogOption } from './DiaLogBaseScript';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import EventDef from '../../constants/EventDef';
import { LevelConfig } from '../../configs/LevelConfig';
import { GoalTypeCounter, GoalValue } from '../../game/goal/GoalTyps';
import CustomSprite from '../componetUtils/CustomSprite';
import { ItemConfig, ItemType } from '../../configs/ItemConfig';
import ConfigMgr from '../../manager/ConfigMgr';
import { configConfigs } from '../../configs/configConfigs';
import CocosUtils from '../../utils/CocosUtils';
import { BundleConfigs } from '../../configs/BundleConfigs';
const { ccclass, property } = _decorator;

@ccclass('DiaLogScript')
export class DiaLogScript extends DiaLogBaseScript {

    @property(Node)
    star1Node: Node;

    @property(Node)
    star2Node: Node;

    @property(Node)
    star3Node: Node;

    @property(Node)
    scoreLabelNode: Node;

    @property(Node)
    successNode: Node;

    @property(Node)
    lightNode: Node;

    @property(Node)
    failedNode: Node;

    @property(Node)
    targetParent: Node = null;

    @property(Node)
    rewardBg: Node = null;
    @property(Node)
    rewardTmp: Node = null;
    @property(Node)
    normalLayout: Node = null;
    @property(Node)
    doubleLayout: Node = null;
    @property(Node)
    doubleNode: Node = null;

    // 成功还是失败
    private success: boolean = false;

    private _normalHeight: number = 240;
    private _doubleHeight: number = 342;

    update(deltaTime: number) {

    }

    setStarCounter(counter: number) {
        StarUtils.changeNodeByCounter(counter, this.star1Node, this.star2Node, this.star3Node);
    }

    setScore(score: number) {
        this.scoreLabelNode.getComponent(Label).string = JSON.stringify(score);
    }

    setSuccess(success: boolean, level: LevelConfig) {
        this.success = success;
        this.lightNode.active = this.successNode.active = this.success;
        this.failedNode.active = !this.success;
        if (!this.success) {
            this._setTarget(level);
        }
    }

    public setRewards(rewards: { type: ItemType, count: number }[], isDouble: boolean) {
        this.rewardBg.getComponent(UITransform).height = isDouble ? this._doubleHeight : this._normalHeight;
        this._initReward(rewards, this.normalLayout);
        this.doubleNode.active = isDouble;
        if (isDouble) {
            this._initReward(rewards, this.doubleLayout);
        }
    }

    private _initReward(rewards: { type: ItemType, count: number }[], parent: Node) {
        for (let reward of rewards) {
            let node = instantiate(this.rewardTmp);
            node.active = true;
            node.parent = parent;
            let item = ConfigMgr.ins.getConfig<ItemConfig>(configConfigs.itemConfig, reward.type);
            if (item) {
                CocosUtils.loadTextureFromBundle(BundleConfigs.iconBundle, item.icon, node.getComponent(Sprite));
            }
            node.getComponentInChildren(Label).string = "+" + reward.count;
        }
    }

    onContinueClick() {
        if (this.dialogOpt && this.dialogOpt.onConform) {
            this.dialogOpt.onConform();
        }
    }

    onCloseClick() {
        qc.panelRouter.hide({
            panel: PanelConfigs.gamePanel,
            onHided: () => {
                qc.panelRouter.destroy({
                    panel: PanelConfigs.gamePanel,
                });
            },
        });
    }

    addStepsByAd() {
        this.node.active = false;
        qc.eventManager.emit(EventDef.Resurrection);
    }

    addStepsByGold() {
        this.node.active = false;
        qc.eventManager.emit(EventDef.Resurrection);
    }

    private _setTarget(level: LevelConfig) {
        if (level) {
            let goal = level.goal as GoalValue;
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
    }
}


