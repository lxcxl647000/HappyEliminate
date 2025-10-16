import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { GoalType, GoalTypeCounter, GoalValue, IGoalScript } from './GoalTyps';
import { GoalProgress } from './GoalProgress';
import { GoalScore } from './GoalScore';
import { GoalTypeCounter4 } from './GoalTypeCounter4';
const { ccclass, property } = _decorator;

@ccclass('GoalFactorys')
export class GoalFactorys {
    /**
     * 根据goal创建不同类似的目标
     * 并且添加到goal区域的Node
     * @param goal 
     * @param prefabs 
     * @param goalLayoutNode 因为node的操作，需要在addChild之后完成，所以将此传递进来
     * @returns 
     */
    public static appendGoalNode(goal: GoalValue | number, prefabs: Prefab[], goalLayoutNode: Node, isReplay: boolean): { goalScript: IGoalScript, goalNode: Node } {
        if (goal instanceof Number) {

            let targetGoalComplete = new GoalProgress();
            targetGoalComplete.score = (goal as Number).valueOf();

            let prefab = prefabs[GoalType.SCORE];
            let node: Node = null;
            if (!isReplay) {
                node = instantiate(prefab);
                // 先添加到node再更新内容
                goalLayoutNode.addChild(node);
            }
            else {
                if (goalLayoutNode.children.length > 0) {
                    node = goalLayoutNode.children[0];
                }
                else {
                    node = instantiate(prefab);
                }
            }
            let goalScore = node.getComponent(GoalScore);
            goalScore.setGoal(targetGoalComplete);

            return {
                goalScript: goalScore,
                goalNode: node
            };
        } else {
            let goalValue = goal as GoalValue;
            if (goalValue.type === GoalType.SCORE) {
                let targetGoalComplete = new GoalProgress();
                targetGoalComplete.score = (goalValue.value as Number).valueOf();

                let prefab = prefabs[GoalType.SCORE];
                let node: Node = null;
                if (!isReplay) {
                    node = instantiate(prefab);
                    // 先添加到node再更新内容
                    goalLayoutNode.addChild(node);
                }
                else {
                    if (goalLayoutNode.children.length > 0) {
                        node = goalLayoutNode.children[0];
                    }
                    else {
                        node = instantiate(prefab);
                    }
                }
                let goalScore = node.getComponent(GoalScore);
                goalScore.setGoal(targetGoalComplete);

                return {
                    goalScript: goalScore,
                    goalNode: node
                };
            }
            else if (goalValue.type === GoalType.TYPE_COUNTER) {
                let targetGoalComplete1 = new GoalProgress();
                targetGoalComplete1.types = goalValue.value as GoalTypeCounter[];
                let prefab1 = prefabs[GoalType.TYPE_COUNTER];
                let node1: Node = null;
                if (!isReplay) {
                    node1 = instantiate(prefab1);
                    // 先添加到node再更新内容
                    goalLayoutNode.addChild(node1);
                }
                else {
                    if (goalLayoutNode.children.length > 0) {
                        node1 = goalLayoutNode.children[0];
                    }
                    else {
                        node1 = instantiate(prefab1);
                    }
                }
                let goalScore1 = node1.getComponent(GoalTypeCounter4);
                goalScore1.setGoal(targetGoalComplete1);

                return {
                    goalScript: goalScore1,
                    goalNode: node1
                };
            }
        }

        // default
        console.log("default");
        let targetGoalCompleteDefault = new GoalProgress();
        targetGoalCompleteDefault.score = 8888;
        let prefabDefault = prefabs[GoalType.SCORE];
        let nodeDefault: Node = null;
        if (!isReplay) {
            nodeDefault = instantiate(prefabDefault);
            // 先添加到node再更新内容
            goalLayoutNode.addChild(nodeDefault);
        }
        else {
            if (goalLayoutNode.children.length > 0) {
                nodeDefault = goalLayoutNode.children[0];
            }
            else {
                nodeDefault = instantiate(nodeDefault);
            }
        }
        let goalScoreDefault = nodeDefault.getComponent(GoalScore);
        goalScoreDefault.setGoal(targetGoalCompleteDefault);

        return {
            goalScript: goalScoreDefault,
            goalNode: nodeDefault
        };
    }
};