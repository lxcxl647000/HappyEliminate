
import { _decorator, Button, Component, Label, Node, Sprite, UITransform, instantiate, Color, ProgressBar } from 'cc';
const { ccclass, property } = _decorator;
import CustomSprite from '../componetUtils/CustomSprite';
import ConfigMgr from '../../manager/ConfigMgr';
import { ItemConfig } from '../../configs/ItemConfig';
import { configConfigs } from '../../configs/configConfigs';
import CocosUtils from '../../utils/CocosUtils';
import { BundleConfigs } from '../../configs/BundleConfigs';
import AchievementApi from '../../api/Achievement';
@ccclass('contentItem')
export class contentItem extends Component {
    @property(Label)
    title: Label = null;
    @property(Node)
    process: Node = null;
    @property(Label)
    processText: Label = null;
    @property(Node)
    ImgListBox: Node = null;
    @property(Node)
    ImgBox: Node = null;
    @property(Node)
    TextBox: Node = null;
    @property(Button)
    submit: Button = null;
    @property(Label)
    submitText: Label = null;
    @property(Node)
    geted: Node = null;
    @property(Node)
    jiaobiao: Node = null
    @property(Node)
    progressBar: Node = null;
    start() {

    }

    update(deltaTime: number) {

    }
    setData(data: any) {
        console.log();

        return new Promise<void>((resolve, reject) => {
            try {
                // 设置标题
                if (this.title) {
                    this.title.string = data.name || '';
                }

                // 设置进度条和进度文本
                if (this.process) {
                    // Number(data.progress_percent) / 100
                    this.progressBar.getComponent(ProgressBar).progress = Number(data.progress_percent) / 100;
                    // this.process.getComponent(UITransform).width = () * 394;
                }
                if (this.processText) {
                      if (data.progress>= data.finish_num) {
                        data.progress = data.finish_num
                    }
                    this.processText.string = `(${ data.progress}/${data.finish_num})`;
                }

                // 设置奖励信息
                if (data.reward_items) {
                    // 清空节点
                    this.ImgListBox.destroyAllChildren();

                    console.log(data, 'data');
                    data.reward_items.forEach((element: any, index: number) => {
                        let item = instantiate(this.TextBox);
                        let itemNode = instantiate(this.ImgBox);

                        item.getComponent(Label).string = element.value

                        let itemConfig = ConfigMgr.ins.getConfig<ItemConfig>(configConfigs.itemConfig, element.id);
                        if (itemConfig) {


                            CocosUtils.loadTextureFromBundle(BundleConfigs.iconBundle, itemConfig.icon, itemNode.getComponent(Sprite))
                        }
                        itemNode.addChild(item);
                        itemNode.active = true;
                        this.ImgListBox.addChild(itemNode);
                        // if (index == data.reward_items.length - 1) {
                        //     this.ImgListBox['flag'] = true
                        // }

                    });



                }
                //  this.submit.node['achievementId']= data.id
                // 设置提交按钮文本和状态
                if (this.submitText) {
                    this.submit.node['achievementId'] = data.id

                    switch (data.can_claim) {
                        case 0: // 未完成
                            if (data.finished == 1) {
                                this.submit.node['data'] = 2
                                this.submit.getComponent(CustomSprite).index = 0
                                this.geted.active = true
                                this.jiaobiao.active = false
                            } else {
                                this.submit.node['data'] = 0
                                this.submit.getComponent(CustomSprite).index = 2
                                this.geted.active = false
                                this.jiaobiao.active = false
                            }
                            this.submitText.string = data.button_text;


                            break;
                        case 1: // 可领取

                            this.submit.node['data'] = 1
                            this.submit.getComponent(CustomSprite).index = 1
                            this.submitText.string = data.button_text;
                            this.submitText.outlineColor = new Color(210, 100, 0, 255);
                            this.geted.active = false
                            this.jiaobiao.active = true
                            break;

                        default:
                            this.submitText.string = '未知状态';
                    }
                }
                resolve();
            } catch (error) {
                reject(error);
            }
        })
    }


}


