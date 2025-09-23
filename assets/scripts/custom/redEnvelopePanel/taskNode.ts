import { _decorator, Component, Label, Node, Sprite, assetManager, ImageAsset, SpriteFrame, Texture2D } from 'cc';
import CustomSprite from '../componetUtils/CustomSprite';
const { ccclass, property } = _decorator;

@ccclass('item')
export class item extends Component {

    @property(Sprite)
    leftImg: Sprite = null;
    @property(Label)
    taskReamake: Label = null;
    @property(Label)
    taskNum: Label = null;
    @property(Label)
    taskAllNum: Label = null;
    @property(Node)
    submitBtn: Node = null;
    start() {

    }

    update(deltaTime: number) {

    }
    submitClick() {
        if (this.submitBtn['data'] == 1) {
            console.log('已完成');

        } else {
            console.log('去完成');
        }
    }
    // 加载远程图片
    setRemoteImage(url: string, nodeSprite: Sprite) {
        assetManager.loadRemote<ImageAsset>(url, function (err, imageAsset) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('没有抛出错误');

            const spriteFrame = new SpriteFrame();
            const texture = new Texture2D();
            texture.image = imageAsset;
            spriteFrame.texture = texture;
            nodeSprite.spriteFrame = spriteFrame;
        });
    }
    setDate(data: any) {
        this.taskReamake.string = data.taskReamake;
        this.taskAllNum.string = data.taskAllNum;
        this.taskNum.string = data.taskNum;
        if (data.taskState == 1) {
            this.submitBtn['data'] = 1
            this.submitBtn.getComponent(CustomSprite).index = 1;
            this.submitBtn.getChildByName("Label").getComponent(Label).string = "已完成";
        } else {
            this.submitBtn['data'] = 0
            this.submitBtn.getComponent(CustomSprite).index = 0;
            this.submitBtn.getChildByName("Label").getComponent(Label).string = "去完成";
        }
        this.setRemoteImage(data.taskImg, this.leftImg)
    }
}


