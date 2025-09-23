import { _decorator, assetManager, AssetManager, ImageAsset, SpriteFrame, Component, instantiate, Label, log, Mask, Node, Sprite, Texture2D } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import CustomSprite from '../componetUtils/CustomSprite';

const { ccclass, property } = _decorator;

@ccclass('userinfoPanel')
export class userinfoPanel extends PanelComponent {
    @property(Node)
    tmp: Node = null;
    @property(Node)
    avatar: Node = null;
    @property(Node)
    boder: Node = null;
    @property(Label)
    userName: Label = null;
    @property(Label)
    UID: Label = null;
    @property(Node)
    contentBg: Node = null;
    @property(Node)
    boxBg: Node = null;
    @property(Label)
    remake: Label = null;
    @property(Node)
    whiteBox: Node = null;
    



    userInfo: any;
    avatarBorder: any
    actAvatarItem: any
    currentItem: Node = null;
    show(option: PanelShowOption): void {
        // console.log(this.tmp);
        log('------------------');
        option.onShowed();
    }
    // 每次打开都会触发
    protected onEnable(): void {
        console.log(this.tmp, 111111111);
    }



    hide(option: PanelHideOption): void {
        option.onHided();
    }
    // 只会触发一次
    start() {
        this.init()
    }
    update(deltaTime: number) {

    }
    // 点击使用
    actAvatarFn() {
        // ajaxs请求
        try {
            console.log(this.actAvatarItem, '选中的数据传给后端');
            // this.closeModel()
        } catch (error) {

        }


    }

    init() {
        this.userInfo = { avatar: 'https://cdn.yundps.com/new/2025/09/18/15/9f48573c0fef8d454ed689f12348c639.png', name: '昵称123456', Uid: '1234567890' }
        this.avatarBorder = [{ avatarBorder: 'https://cdn.yundps.com/new/2025/09/18/15/2ad511e08ef0593e6f3b85c834b9ae2c.png', flag: true, r: '头衔3111111111111111111111111' }, { avatarBorder: 'https://cdn.yundps.com/new/2025/09/18/15/4287e0d9f39ff31b6feab55ce2cffef2.png', flag: false, r: '头衔2rrrr111111111111111111111111111111' }, { avatarBorder: 'https://cdn.yundps.com/new/2025/09/18/14/8313f77c1eb9ef4adf0a652fcce46a77.png', flag: false, r: '头衔1rrrr1111111111111111111111111111' }]
        // 获取用户信息
        this.userName.string = '昵称：' + this.userInfo.name
        this.UID.string = 'UID：' + this.userInfo.Uid
        this.whiteBox.parent.parent.on('touch-start', () => {
            console.log('点击了白框');

            if (this.whiteBox.active == true) {
                this.whiteBox.active = false
            }
        }, this)
        // 获取头像node
        this.getUerInfoAvatar()
        // this.mHead.updateItem({ border: '', nickName: '', avatar: '' });
        // 获取列表Node
        this.getboedrListNode()
    }
    getUerInfoAvatar() {
        let itemNode: Node = instantiate(this.tmp);


        this.avatarBorder.forEach((item) => {
            if (item.flag) {

                this.setRemoteImage(item.avatarBorder, itemNode.getChildByName('Mask').getComponent(Sprite))
            }
        })
        this.setRemoteImage(this.userInfo.avatar, itemNode.getChildByName('avatar').getComponent(Sprite))
        itemNode.active = true

        this.avatar.addChild(itemNode)
    }


    getboedrListNode() {
        this.avatarBorder.forEach((item, index) => {
            let itemNode: Node = instantiate(this.tmp);
            itemNode.active = true


            if (item.flag) {
                itemNode.getChildByName('defult').active = true
                if (itemNode.getComponent(CustomSprite)) {

                    itemNode.getComponent(CustomSprite).index = 1
                }
                this.actAvatarItem = itemNode['itemData'];

                this.remake.string = item.r
                this.currentItem = itemNode;
            } else {
                if (itemNode.getComponent(CustomSprite)) {

                    itemNode.getComponent(CustomSprite).index = 0
                }
            }

            itemNode['itemData'] = item;
            itemNode.on('touch-start', (e) => {
                e.propagationStopped = true
                console.log('选中的数据');
                if (this.currentItem) {
                    this.currentItem.getComponent(CustomSprite).index = 0
                }
                this.actAvatarItem = itemNode['itemData'];
                this.whiteBox.active = true
                this.remake.string = item.r
                this.currentItem = itemNode;
                if (this.actAvatarItem == itemNode['itemData']) {
                    itemNode.getComponent(CustomSprite).index = 1
                    return
                }




            }, this)
            this.setRemoteImage(item.avatarBorder, itemNode.getChildByName('Mask').getComponent(Sprite))
            this.setRemoteImage(this.userInfo.avatar, itemNode.getChildByName('avatar').getComponent(Sprite))
            this.boder.addChild(itemNode)
        })


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
    closeModel() {
        qc.panelRouter.hide({
            panel: PanelConfigs.userInfoPanel,
            onHided: () => {
                console.log('close test panel-----------');

            }
        });
    }
}


