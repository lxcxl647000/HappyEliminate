import { _decorator, Component, Label, Node } from 'cc';
import { GoalType, IGoalScript } from './GoalTyps';
import { GoalProgress } from './GoalProgress';
const { ccclass, property } = _decorator;

/**
 * 目标是达到一定的分数
 */
@ccclass('GoalScore')
export class GoalScore extends Component implements IGoalScript {
    @property(Node)
    scoreValueNode: Node;

    @property(Node)
    completeNode: Node;

    private goalScore: number = 0;
    private goalProgress: GoalProgress = new GoalProgress();

    start() {
        this.completeNode.active = false;
    }

    update(deltaTime: number) {
    }

    getGoalType(): GoalType {
        return GoalType.SCORE;
    }

    setGoal(goalProgress: GoalProgress) {
        this.goalScore = goalProgress.score;
        this.goalProgress = goalProgress;

        // 更新目标数字
        this.scoreValueNode.getComponent(Label).string = JSON.stringify(this.goalScore);
        this.completeNode.active = false;
    }
    getGoal(): GoalProgress {
        return this.goalProgress;
    }

    updateGoal(progress: GoalProgress) {
        if (progress.score >= this.goalScore) {
            // finish
            // 显示完成
            this.completeNode.active = true;
        }
    }

    isComplete(): boolean {
        return this.completeNode.active;
    }
}


