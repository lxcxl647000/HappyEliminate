import { _decorator, assetManager, AssetManager, ImageAsset, SpriteFrame, Component, instantiate, Label, log, Mask, Node, Sprite, Texture2D, UITransform, UI } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import CustomSprite from '../componetUtils/CustomSprite';


const { ccclass, property } = _decorator;
@ccclass('redEnvelopePanel')
export class redEnvelopePanel extends PanelComponent {
    @property(Node)
    titleRemake: Node = null;
    @property(Node)
    proessNode: Node = null;
    @property(Node)
    proessAct: Node = null;
    @property(Node)
    proessText: Node = null;
    @property(Label)
    labelText: Label = null;
    @property(Label)
    labelText1: Label = null;
    @property(Label)
    labelText2: Label = null;
    @property(Node)
    redEnvelopeImg: Node = null;
    flag: boolean = false;
    proessDate: any = null;
    show(option: PanelShowOption): void {
        // console.log(this.tmp);
        log('------------------');
        option.onShowed();

        this.init();
    }
    // 每次打开都会触发
    protected onEnable(): void {
        // console.log(this.tmp, 111111111);
    }



    hide(option: PanelHideOption): void {
        option.onHided();
    }
    // 只会触发一次
    start() {


    }
    update(deltaTime: number) {

    }
    closeModel() {
        qc.panelRouter.hide({
            panel: PanelConfigs.redEnvelopeModelPanel,
            onHided: () => {
                console.log('close test panel-----------');

            }
        });
    }
    init() {
        this.proessDate = { all: 10, now: 7, proess: 0.7 }
        if (!this.flag) {
            this.titleRemake.active = false;
            this.proessAct.getComponent(UITransform).width = this.proessDate.now / this.proessDate.all * 403;
            this.labelText.string = this.proessDate.all - this.proessDate.now + '关'
            this.labelText1.string = this.proessDate.now
            this.labelText2.string = this.proessDate.all

            for (let index = 0; index < 3; index++) {
                let itemNode = instantiate(this.redEnvelopeImg);
                let x = 0

                if (index == 1) {
                    x = 73
                    if (this.proessDate.proess > 0.6) {
                        itemNode.getComponent(CustomSprite).index = 1
                    } else {
                        itemNode.getComponent(CustomSprite).index = 0
                    }
                } else if (index == 2) {
                    x = 202
                    if (this.proessDate.proess == 1) {
                        itemNode.getComponent(CustomSprite).index = 1
                    }
                } else {
                    x = -172
                    if (this.proessDate.proess > 0) {
                        itemNode.getComponent(CustomSprite).index = 1
                    }
                }
                itemNode.position.set(x, 14, 0)
                itemNode.active = true
                this.proessNode.addChild(itemNode);
            }
            this.proessNode.active = true;
        } else {
            this.titleRemake.active = true;
            this.proessNode.active = false;
        }
    }
    goGame() {
        console.log('跳转到游戏');
        this.closeModel()
    }

}


