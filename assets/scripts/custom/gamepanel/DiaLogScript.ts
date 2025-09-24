import { _decorator, Label, Node } from 'cc';
import { StarUtils } from './StarUtils';
import { DiaLogBaseScript, IDialogOption } from './DiaLogBaseScript';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import EventDef from '../../constants/EventDef';
import { Level } from '../../game/Level';
import { GoalTypeCounter, GoalValue } from '../../game/goal/GoalTyps';
import CustomSprite from '../componetUtils/CustomSprite';
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

    // 成功还是失败
    private success: boolean = false;

    update(deltaTime: number) {

    }

    setStarCounter(counter: number) {
        StarUtils.changeNodeByCounter(counter, this.star1Node, this.star2Node, this.star3Node);
    }

    setScore(score: number) {
        this.scoreLabelNode.getComponent(Label).string = JSON.stringify(score);
    }

    setSuccess(success: boolean, level: Level) {
        this.success = success;
        this.lightNode.active = this.successNode.active = this.success;
        this.failedNode.active = !this.success;
        if (!this.success) {
            this._setTarget(level);
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

    private _setTarget(level: Level) {
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


