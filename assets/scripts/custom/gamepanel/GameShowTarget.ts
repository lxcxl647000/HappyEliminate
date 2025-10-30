import { _decorator, Component, Label, Node } from 'cc';
import { LevelConfig } from '../../configs/LevelConfig';
import { TargetForTypeCount, ITargetVal } from '../../game/target/TargetTyps';
import CustomSprite from '../componetUtils/CustomSprite';
const { ccclass, property } = _decorator;

@ccclass('GameShowTarget')
export class GameShowTarget extends Component {
    @property(Node)
    targetParent: Node = null;

    public showTarget(level: LevelConfig) {
        this.node.active = true;
        if (level) {
            let target = level.target as ITargetVal;
            if (target) {
                let targets = target.value as TargetForTypeCount[];
                for (let i = 0; i < this.targetParent.children.length; i++) {
                    let target = this.targetParent.children[i];
                    target.active = i < targets.length;
                    if (target.active) {
                        let icon = target.getComponent(CustomSprite);
                        icon.index = targets[i].blockType;
                        icon.getComponentInChildren(Label).string = "x" + targets[i].count;
                    }
                }
            }
        }
    }

    public hideTarget() {
        this.node.active = false;
    }
}