import { _decorator, Component, Label, Node, UITransform } from 'cc';
import CustomSprite from '../componetUtils/CustomSprite';
const { ccclass, property } = _decorator;

@ccclass('avatar')
export class avatar extends Component {
    @property(CustomSprite)
    cs = null;
    @property(Node)
    avatarContentBox = null;
    @property(Node)
    gameHistoryBox = null;
    // 关卡记录
    @property(Label)
    guanka = null;
    @property(Label)
    // 胜利星记录
    slxNum = null;
    // 最外层节点背景图片大小控制
    @property(Node)
    boxAllbg = null;
    // 父节点背景图片大小控制
    @property(Node)
    parentBg = null;
    start() {
        this.init()
    }
    avatarClick() {

        if (this.node.name == 'gameHistoryBtn') {
            this.avatarContentBox.active = false;
            this.gameHistoryBox.active = true;
            this.boxAllbg.getComponent(UITransform).height = 569
            this.parentBg.getComponent(UITransform).height = 360

        } else {
            this.avatarContentBox.active = true;
            this.gameHistoryBox.active = false;
            this.boxAllbg.getComponent(UITransform).height = 736
            this.parentBg.getComponent(UITransform).height = 530
        }
        this.node.getComponent(CustomSprite).index = 0
        this.cs.index = 1;
    }

    update(deltaTime: number) {

    }
    init() {
        this.guanka.string = '100关'
        this.slxNum.string = '300个'
        this.avatarContentBox.active = false;
        this.gameHistoryBox.active = true;
        this.boxAllbg.getComponent(UITransform).height = 569
        this.parentBg.getComponent(UITransform).height = 360

        if (this.node.name == 'gameHistoryBtn') {
            this.node.getComponent(CustomSprite).index = 0
        }

    }
}


