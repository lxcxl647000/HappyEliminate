import { _decorator, Component, Label, Node } from 'cc';
import { LevelConfig } from '../../configs/LevelConfig';
import { GoalTypeCounter, GoalValue } from '../../game/goal/GoalTyps';
import CustomSprite from '../componetUtils/CustomSprite';
const { ccclass, property } = _decorator;

@ccclass('GameShowTarget')
export class GameShowTarget extends Component {
    @property(Node)
    targetParent: Node = null;

    public showTarget(level: LevelConfig) {
        this.node.active = true;
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
                        icon.getComponentInChildren(Label).string = "x" + goals[i].counter;
                    }
                }
            }
        }
    }

    public hideTarget() {
        this.node.active = false;
    }
}