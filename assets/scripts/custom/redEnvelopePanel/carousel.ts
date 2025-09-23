import { _decorator, Component, Node, instantiate, tween, Vec3, Tween, assetManager, Sprite, ImageAsset, SpriteFrame, Texture2D, Label } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('carousel')
export class carousel extends Component {
    @property(Node)
    carouselNode: Node = null;

    tweenDuration: number = 10.0;
    private itemPool: Node[] = [];
    private activeTweens: Map<Node, Tween<Node>> = new Map();
    private spawnIntervalId: any = null;

    carouselList: any = [{ name: '梨花', result: '5分钟钱开出了8.8红包', avatar: 'https://cdn.yundps.com/new/2025/09/18/15/2ad511e08ef0593e6f3b85c834b9ae2c.png' },
    { name: '梨花4123123', result: '15分钟钱开出了6.8红包', avatar: 'https://cdn.yundps.com/new/2025/09/18/15/2ad511e08ef0593e6f3b85c834b9ae2c.png' }
        , { name: '梨123花', result: '53分钟钱开出了8.5红包', avatar: 'https://cdn.yundps.com/new/2025/09/18/15/2ad511e08ef0593e6f3b85c834b9ae2c.png' }
    ];
    start() {
        this.initializeItemPool();
        this.startSpawningItems();
    }

    // 初始化节点对象池
    private initializeItemPool() {
        // 预先创建5个节点实例
        this.carouselList.forEach((item) => {
            const itemNode = instantiate(this.carouselNode);
            this.setRemoteImage(item.avatar, itemNode.getChildByName('avatar').getComponent(Sprite))
            itemNode.getChildByName('Node').getChildByName('Label').getComponent(Label).string = item.result;
            itemNode.getChildByName('Node').getChildByName('name').getComponent(Label).string = item.name;
            itemNode.active = false;
            this.itemPool.push(itemNode);
            this.node.addChild(itemNode);
        })

    }

    // 开始定时生成项目
    private startSpawningItems() {
        let index = 0;
        // 立即启动第一个节点
        this.spawnItem(index++);
        this.spawnIntervalId = setInterval(() => {
            this.spawnItem(index++);
        }, this.tweenDuration * 1000 / 2);
    }

    // 生成并动画化单个项目
    private spawnItem(index: number) {
        const itemNode = this.getAvailableItem();
        if (itemNode) {
            // 更新节点数据
            const itemData = this.carouselList[index % this.carouselList.length];
            this.setRemoteImage(itemData.avatar, itemNode.getChildByName('avatar').getComponent(Sprite));
            itemNode.getChildByName('Node').getChildByName('Label').getComponent(Label).string = itemData.result;
            itemNode.getChildByName('Node').getChildByName('name').getComponent(Label).string = itemData.name;

            itemNode.active = true;
            this.tweenStart(itemNode, index);
        }
    }

    // 从对象池获取可用节点
    private getAvailableItem(): Node | null {
        // 查找未激活的节点
        let itemNode = this.itemPool.find(node => !node.active);

        // 如果没有可用节点，返回null
        return itemNode || null;
    }

    update(deltaTime: number) {
        // 游戏逻辑更新
    }

    // 启动节点动画
    tweenStart(node: Node, index: number) {
        // 计算Y轴位置（奇偶行错开）
        const y = index % 2 === 0 ? -60 : 0;

        // 定义起始和结束位置
        const startPos = new Vec3(459, y, 0);
        const endPos = new Vec3(-758, y, 0);

        // 设置起始位置
        node.position = startPos;

        // 创建并启动缓动动画
        const tweenInstance = tween(node)
            .to(this.tweenDuration, { position: endPos })
            .call(() => {
                // 动画结束后重置节点位置并重新开始
                node.position = startPos;
                this.tweenStart(node, index);
            })
            .start();

        // 保存动画实例以便后续控制
        this.activeTweens.set(node, tweenInstance);
    }

    // 停止单个节点的动画
    stop(node: Node) {
        if (this.activeTweens.has(node)) {
            this.activeTweens.get(node)?.stop();
            this.activeTweens.delete(node);
        }
        node.active = false;
    }

    // 停止所有动画
    stopAll() {
        this.activeTweens.forEach(tween => tween.stop());
        this.activeTweens.clear();

        this.itemPool.forEach(node => {
            node.active = false;
        });
    }

    // 组件销毁时清理资源
    onDestroy() {
        // 清理定时器
        if (this.spawnIntervalId) {
            clearInterval(this.spawnIntervalId);
            this.spawnIntervalId = null;
        }

        // 停止所有动画
        this.stopAll();
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
}