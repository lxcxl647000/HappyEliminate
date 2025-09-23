
import { _decorator, Button, Component, Label, Node, Sprite, UITransform, instantiate, Color } from 'cc';
const { ccclass, property } = _decorator;
import CustomSprite from '../componetUtils/CustomSprite';
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
                    this.process.getComponent(UITransform).width = data.taskProgress * 403;
                }
                if (this.processText) {
                    this.processText.string = `(${data.taskNum || 0}/${data.taskAllNum || 0})`;
                }

                // 设置奖励信息
                if (data.Reward) {
                    data.Reward.forEach((element: any) => {
                        let item = instantiate(this.TextBox);
                        let itemNode = instantiate(this.ImgBox);
                        item.getComponent(Label).string = '+' + element.num
                        itemNode.getComponent(CustomSprite).index = element.type - 1;
                        itemNode.addChild(item);
                        itemNode.active = true;
                        this.ImgListBox.addChild(itemNode);

                    });

                }

                // 设置提交按钮文本和状态
                if (this.submitText) {
                    switch (data.taskState) {
                        case 0: // 未完成
                            this.submit['data'] = 0
                            this.submit.getComponent(CustomSprite).index = 0
                            this.submitText.string = '未完成';
                            break;
                        case 1: // 可领取
                            this.submit['data'] = 1
                            this.submit.getComponent(CustomSprite).index = 1
                            this.submitText.string = '领取奖励';
                            this.submitText.outlineColor = new Color(210, 100, 0, 255);
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
      
    submitBtn() {
        if (this.submit['data'] == 1) {
            console.log('领取奖励')
        } else {
            console.log('完成任务')
        }
    }
}


