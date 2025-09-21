import { _decorator, Component, Node } from 'cc';
import { GoalType, GoalTypeCounter, IGoalScript } from './GoalTyps';
import { GoalProgress } from './GoalProgress';
import { GoalTypeCounterItem } from './GoalTypeCounterItem';
const { ccclass, property } = _decorator;

/**
 * 目标是达到一定的分数
 */
@ccclass('GoalTypeCounter4')
export class GoalTypeCounter4 extends Component implements IGoalScript {
    @property(Node)
    type1: Node;

    @property(Node)
    type2: Node;

    @property(Node)
    type3: Node;

    @property(Node)
    type4: Node;

    // 需要达成的目标, 最多四个
    private goalProgress: GoalProgress = null;

    onLoad() {
        // 默认全部隐藏，根据设定的目标来看
        this.type1.active = false;
        this.type2.active = false;
        this.type3.active = false;
        this.type4.active = false;
    }

    update(deltaTime: number) {
    }

    getGoalType(): GoalType {
        return GoalType.TYPE_COUNTER;
    }

    setGoal(goalProgress: GoalProgress) {
        this.goalProgress = goalProgress

        if (this.goalProgress.types !== null) {
            let types = this.goalProgress.types;
            this.updateTypes(types);
        }
    }

    getGoal(): GoalProgress {
        return this.goalProgress;
    }

    private updateTypes(types: GoalTypeCounter[]) {
        if (types.length > 0) {
            this.setTypeWithGoal(this.type1, types[0]);
        }
        if (types.length > 1) {
            this.setTypeWithGoal(this.type2, types[1]);
        }
        if (types.length > 2) {
            this.setTypeWithGoal(this.type3, types[2]);
        }
        if (types.length > 3) {
            this.setTypeWithGoal(this.type4, types[3]);
        }
    }

    /**
     * 更新目标完成情况
     * @param progress 
     */
    updateGoal(progress: GoalProgress) {
        this.goalProgress = this.goalProgress;
        // 根据类型进行更新
        if (progress.types !== null) {
            let types = progress.types;
            this.updateTypes(types);
        }
    }

    isComplete(): boolean {
        if (this.goalProgress && this.goalProgress.types !== null) {
            for (let index = 0; index < this.goalProgress.types.length; index++) {
                const element = this.goalProgress.types[index];
                if (element.counter > 0) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }


    private setTypeWithGoal(typeItem: Node, goalItem: GoalTypeCounter) {
        let typeItemScript = typeItem.getComponent(GoalTypeCounterItem);
        typeItemScript.setType(goalItem.cellType);
        typeItemScript.setNumber(goalItem.counter);
        if (goalItem.counter <= 0) {
            typeItemScript.setComplete(true);
        } else {
            typeItemScript.setComplete(false);
        }

        typeItem.active = true;
    }
}


