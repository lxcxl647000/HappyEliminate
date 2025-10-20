import { _decorator, Color, instantiate, Label, Node, Sprite, UITransform } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import themesApi from '../../api/themes';
import { item } from '../redEnvelopePanel/taskNode';
import CustomSprite from '../componetUtils/CustomSprite';
import { qc } from '../../framework/qc';
import EventDef from '../../constants/EventDef';
import { PanelConfigs } from '../../configs/PanelConfigs';

const { ccclass, property } = _decorator;

@ccclass('bgztpanel')
export class bgztpanel extends PanelComponent {
    @property(Node)
    theme: Node = null;
    @property(Node)
    theme_item: Node = null;
    @property(Node)
    bgImg: Node = null
    @property(Node)
    suoBg: Node = null
    @property(Node)
    suo: Node = null
    @property(Label)
    themeNum: Label = null;
    start() {

    }
    show(option: PanelShowOption): void {
        option.onShowed();
        this.getList()
    }
    getList() {
        themesApi.ins.getThemesList().then(res => {

            if (res.code == 200) {
                this.themeNum.string = res.data.fragments
                if (this.theme.children.length > 0) {
                    this.theme.removeAllChildren()
                }

                res.data.list.forEach(item => {

                    if (item.id == 1) {
                        this.bgImg.getComponent(CustomSprite).index = 1
                    } else if (item.id == 2) {
                        this.bgImg.getComponent(CustomSprite).index = 0
                    }
                    if (item.owned == 1) {
                        this.suo.active = false
                        this.suoBg.active = false


                    } else {
                        this.suo.active = true
                        this.suoBg.active = true

                    }
                    let node = instantiate(this.theme_item)
                    node['bg_id'] = item.id
                    node['title_name'] = item.name
                    node['owned'] = item.owned
                    node.active = true
                    this.theme.addChild(node)

                });
                qc.eventManager.emit('Call_Banner')
            }
        })
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }
    update(deltaTime: number) {

    }
    onEnable() {
        qc.eventManager.on(EventDef.Update_Theme_Clips, this.getList, this);


    }
    protected onDisable(): void {
        qc.eventManager.off(EventDef.Update_Theme_Clips, this.getList, this);
    }
    closeModel() {
        this.theme.removeAllChildren()
        qc.panelRouter.hide({
            panel: PanelConfigs.bgztPanel,
            onHided: () => {
                console.log('close test panel-----------');

            }
        });
    }
}


