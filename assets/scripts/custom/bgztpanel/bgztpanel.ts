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
    @property(Node)
    btn: Node = null;
    @property(Node)
    btnIcon: Node = null;
    @property(Label)
    btnLabel: Label = null;
    start() {

    }
    show(option: PanelShowOption): void {
        option.onShowed();
        this.getList(true);
    }
    getList(isFirst?: boolean) {
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
            if (isFirst) {
                qc.eventManager.emit(EventDef.Close_Loading);
            }
        })
    }

    private _updateTheme() {
        themesApi.ins.getThemesList().then(res => {
            if (res.code == 200) {
                this.themeNum.string = res.data.fragments
                if (this.theme.children) {
                    for (let i = 0; i < this.theme.children.length; i++) {
                        let themeNode = this.theme.children[i];
                        let item = res.data.list[i];
                        if (item.id == 1) {
                            themeNode.getComponentInChildren(CustomSprite).index = 1
                        } else if (item.id == 2) {
                            themeNode.getComponentInChildren(CustomSprite).index = 0
                        }
                        let bgSuo = themeNode.getChildByName('bgsuo');
                        let suo = themeNode.getChildByName('suo');
                        suo.active = bgSuo.active = item.owned != 1;
                        themeNode['bg_id'] = item.id;
                        themeNode['title_name'] = item.name;
                        themeNode['owned'] = item.owned;
                        themeNode.active = true;
                    }
                }
                this.btnIcon.active = false;
                this.btn.getComponent(CustomSprite).index = 0;
                this.btnLabel.string = '立即使用';
            }
        });
    }

    hide(option: PanelHideOption): void {
        option.onHided();
    }
    update(deltaTime: number) {

    }
    onEnable() {
        qc.eventManager.on(EventDef.Update_Theme_Clips, this._updateTheme, this);


    }
    protected onDisable(): void {
        qc.eventManager.off(EventDef.Update_Theme_Clips, this._updateTheme, this);
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


