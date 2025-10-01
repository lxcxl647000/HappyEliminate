import { _decorator, Component, assetManager, Sprite, ImageAsset, SpriteFrame, Texture2D, Label } from 'cc';
import CocosUtils from '../utils/CocosUtils';
const { ccclass, property } = _decorator;

@ccclass('taskItems')
export class taskItems extends Component {
    @property(Label)
    title: Label = null;
    @property(Label)
    subtitle: Label = null;
    @property(Label)
    button_text: Label = null;
    @property(Label)
    money: Label = null;
    @property(Sprite)
    taskImg: Sprite = null;

    start() {

    }

    protected onEnable(): void {
    }



    update(deltaTime: number) {

    }

    // 加载远程图片
    setRemoteImage(url: string, nodeSprite: Sprite) {
        CocosUtils.loadRemoteTexture(url, nodeSprite);
    }

    setData(data: any) {
        // 标题
        if (this.title) {
            this.title.string = data.title || '';
        }
        // 小标题
        if (this.subtitle) {
            this.subtitle.string = data.subtitle || '';
        }
        // 奖励
        if (this.money) {
            this.money.string = data.money || '0';
        }
        // 按钮文字
        if (this.button_text) {
            this.button_text.string = data.button_text;
        }
        // 任务图标
        if (this.taskImg) {
            // this.setRemoteImage(data.image, this.taskImg);
        }
    }

    // 去完成
    handleComplete() { }
}


