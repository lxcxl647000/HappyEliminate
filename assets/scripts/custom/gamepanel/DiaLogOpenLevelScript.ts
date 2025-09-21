import { _decorator, Node, Prefab } from 'cc';
import { DiaLogBaseScript } from './DiaLogBaseScript';
import { GoalValue } from '../../game/goal/GoalTyps';
import { GoalFactorys } from '../../game/goal/GoalFactorys';
const { ccclass, property } = _decorator;

@ccclass('DiaLogOpenLevelScript')
export class DiaLogOpenLevelScript extends DiaLogBaseScript {

    @property(Node)
    goalLayoutNode: Node

    @property([Prefab])
    goalPrefabs: Prefab[] = new Array<Prefab>();

    start() {

    }

    update(deltaTime: number) {

    }

    setGoal(goal: GoalValue | number) {
        GoalFactorys.appendGoalNode(goal, this.goalPrefabs, this.goalLayoutNode);
    }

    onPlayButtonClick() {
        if (this.dialogOpt && this.dialogOpt.onConform) {
            this.dialogOpt.onConform();
        }
    }

    onExitButtonClick() {
        if (this.dialogOpt && this.dialogOpt.onCancel) {
            this.dialogOpt.onCancel();
        }

    }
}


