import { _decorator, Label, Node } from 'cc';
import { StarUtils } from './StarUtils';
import { DiaLogBaseScript } from './DiaLogBaseScript';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
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
    failedNode: Node;

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

    setSuccess(success: boolean) {
        this.success = success;
        this.successNode.active = this.success;
        this.failedNode.active = !this.success;
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
}


