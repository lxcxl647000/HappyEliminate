import { _decorator, Component, Label, Node } from 'cc';
import { TargetTyps, ITarget } from './TargetTyps';
import { TargetProgressInfo } from './TargetProgressInfo';
const { ccclass, property } = _decorator;

@ccclass('TargetScore')
export class TargetScore extends Component implements ITarget {
    @property(Label)
    scoreLabel: Label;
    @property(Node)
    completeNode: Node;

    private score: number = 0;
    private progressInfo: TargetProgressInfo = new TargetProgressInfo();

    start() {
        this.completeNode.active = false;
    }

    update(deltaTime: number) {
    }

    getType(): TargetTyps {
        return TargetTyps.Type_Score;
    }

    setTarget(progressInfo: TargetProgressInfo) {
        this.score = progressInfo.score;
        this.progressInfo = progressInfo;
        this.scoreLabel.string = JSON.stringify(this.score);
        this.completeNode.active = false;
    }
    getTarget(): TargetProgressInfo {
        return this.progressInfo;
    }

    updateTarget(progress: TargetProgressInfo) {
        if (progress.score >= this.score) {
            this.completeNode.active = true;
        }
    }

    isComplete(): boolean {
        return this.completeNode.active;
    }
}