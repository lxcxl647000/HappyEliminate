import { _decorator, Component, Node } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from "db://assets/scripts/framework/lib/router/PanelComponent";
import {qc} from "db://assets/scripts/framework/qc";
import {PanelConfigs} from "db://assets/scripts/configs/PanelConfigs";
const { ccclass, property } = _decorator;

@ccclass('TaskPanel')
export class TaskPanel extends PanelComponent {
    start() {

    }

    update(deltaTime: number) {
        
    }
    show(option: PanelShowOption): void {
        option.onShowed();
    }

    hide(option: PanelHideOption): void {
        option.onHided();
    }

    // 关闭弹框
    handleClosePop() {
        qc.panelRouter.hide({
            panel: PanelConfigs.taskPanel
        })
    }
}


