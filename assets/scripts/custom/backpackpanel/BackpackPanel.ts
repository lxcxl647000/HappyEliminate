import { _decorator, instantiate, Node, Label } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from "../../framework/lib/router/PanelComponent";
import { qc } from "../../framework/qc";
import CustomSprite from '../componetUtils/CustomSprite';
import { PanelConfigs } from "../../configs/PanelConfigs";
const { ccclass, property } = _decorator;

@ccclass('BackpackPanel')
export class BackpackPanel extends PanelComponent {
    @property(Node)
    contentNode: Node = null;


    init() {
        let data =  [
            {
                type: 1,
                count: 10
            },
            {
                type: 2,
                count: 10
            },
            {
                type: 3,
                count: 10
            },
            {
                type: 2,
                count: 10
            },
            {
                type: 3,
                count: 10
            },
            {
                type: 2,
                count: 10
            },
            {
                type: 1,
                count: 10
            }
        ]

        for (let i = 0; i < data.length; i++) {
            let itemNode = instantiate(this.contentNode);
            itemNode.active = true;
            this.contentNode.parent.addChild(itemNode);
            // type: 1-炸弹，2-步数，3-糖豆
            switch (data[i].type) {
                case 1:
                    itemNode.getChildByName('itemImg').getComponent(CustomSprite).index = 0;
                    break;
                case 2:
                    itemNode.getChildByName('itemImg').getComponent(CustomSprite).index = 1;
                    break;
                case 3:
                    itemNode.getChildByName('itemImg').getComponent(CustomSprite).index = 2;
                    break;
            }
            itemNode.getComponentInChildren(Label).string = `x${ data[i].count }`;
        }
    }
    start() {

    }

    update(deltaTime: number) {
        
    }
    show(option: PanelShowOption): void {
        option.onShowed();
        this.init();
    }

    hide(option: PanelHideOption): void {
        option.onHided();
    }

    // 关闭弹框
    handleClosePop() {
        qc.panelRouter.hide({
            panel: PanelConfigs.backpackPanel
        })
    }
}


