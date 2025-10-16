// carousel.ts

import { _decorator, Component, Node, instantiate, tween, Vec3, Tween, assetManager, Sprite, ImageAsset, SpriteFrame, Texture2D, Label } from 'cc';
import CocosUtils from '../../utils/CocosUtils';
import cgRedEvApi from '../../api/cgRedEv';
const { ccclass, property } = _decorator;

@ccclass('carousel')
export class carousel extends Component {
    @property(Node)
    carouselNode: Node = null;

    tweenDuration: number = 10.0;
    private itemPool: Node[] = [];
    private activeTweens: Map<Node, Tween<Node>> = new Map();
    private spawnIntervalId: any = null;
    
    // 最大同时显示的节点数
    private maxVisibleNodes: number = 3;
    // 当前显示的节点索引集合
    private visibleNodes: Set<Node> = new Set();

    carouselList: any = [{ name: '梨花', result: '5分钟钱开出了8.8红包', avatar: 'https://cdn.yundps.com/new/2025/09/18/15/2ad511e08ef0593e6f3b85c834b9ae2c.png' },
    { name: '梨花4123123', result: '15分钟钱开出了6.8红包', avatar: 'https://cdn.yundps.com/new/2025/09/18/15/2ad511e08ef0593e6f3b85c834b9ae2c.png' }
        , { name: '梨123花', result: '53分钟钱开出了8.5红包', avatar: 'https://cdn.yundps.com/new/2025/09/18/15/2ad511e08ef0593e6f3b85c834b9ae2c.png' }
    ];
    
    start() {
        // this.initializeItemPool();
        // this.startSpawningItems();
    }

    show(data: any) {
        data.map((item) => {
            item.result = item.ago + '开出了' + item.amount + '元红包';
        })
        console.log(11111111111);

        this.carouselList = data;
        this.initializeItemPool();
        this.startSpawningItems();
    }
    
    getList(dataList: any) {
        this.carouselList = dataList;
    }
    
    // 初始化节点对象池
    private initializeItemPool() {
        // 先清理现有节点
        this.stopAll();
        
        // 确保有足够的节点（最多3个）
        const neededNodes = Math.min(this.maxVisibleNodes, this.carouselList.length);
        for (let i = this.itemPool.length; i < neededNodes; i++) {
            const itemNode = instantiate(this.carouselNode);
            itemNode.active = false;
            this.itemPool.push(itemNode);
            this.node.addChild(itemNode);
        }
        
        // 如果节点过多，移除多余的
        while (this.itemPool.length > neededNodes) {
            const nodeToRemove = this.itemPool.pop();
            if (nodeToRemove) {
                this.node.removeChild(nodeToRemove);
            }
        }
    }

    // 开始定时生成项目
    private startSpawningItems() {
        // 清理之前的定时器
        if (this.spawnIntervalId) {
            clearInterval(this.spawnIntervalId);
        }
        
        let index = 0;
        // 立即启动第一个节点
        this.spawnItem(index++);
        
        // 每隔一段时间生成新项目，最多只保持3个节点在屏幕上
        this.spawnIntervalId = setInterval(() => {
            // 只有当可见节点数少于最大值时才生成新节点
            if (this.visibleNodes.size < this.maxVisibleNodes && this.itemPool.some(node => !node.active)) {
                this.spawnItem(index++);
            }
        }, this.tweenDuration * 1000 / 2);
    }

    // 生成并动画化单个项目
    private spawnItem(index: number) {
        const itemNode = this.getAvailableItem();
        if (itemNode) {
            // 更新节点数据
            const itemData = this.carouselList[index % this.carouselList.length];

            // 更新显示内容
            itemNode.getChildByName('Node').getChildByName('Label').getComponent(Label).string = itemData.result;
            itemNode.getChildByName('Node').getChildByName('name').getComponent(Label).string = itemData.name;

            // 标记节点为可见
            this.visibleNodes.add(itemNode);
            itemNode.active = true;
            
            // 启动动画
            this.tweenStart(itemNode, index);
        }
    }

    // 从对象池获取可用节点
    private getAvailableItem(): Node | null {
        // 查找未激活的节点
        let itemNode = this.itemPool.find(node => !node.active);

        return itemNode || null;
    }

    update(deltaTime: number) {
        // 游戏逻辑更新
    }

    // 启动节点动画
    tweenStart(node: Node, index: number) {
        // 计算Y轴位置（奇偶行错开）
        const y = (this.visibleNodes.size % 2 === 0) ? -60 : 0;

        // 定义起始和结束位置
        const startPos = new Vec3(459, y, 0);
        const endPos = new Vec3(-758, y, 0);

        // 设置起始位置
        node.position = startPos;

        // 创建并启动缓动动画
        const tweenInstance = tween(node)
            .to(this.tweenDuration, { position: endPos })
            .call(() => {
                // 动画结束后，隐藏节点并从可见集合中移除
                this.visibleNodes.delete(node);
                
                if (this.activeTweens.has(node)) {
                    this.activeTweens.delete(node);
                }
                node.active = false;
            })
            .start();

        // 保存动画实例以便后续控制
        this.activeTweens.set(node, tweenInstance);
    }

    // 停止单个节点的动画
    stop(node: Node) {
        this.visibleNodes.delete(node);

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
        this.visibleNodes.clear();

        this.itemPool.forEach(node => {
            node.active = false;
        });
    }

    protected onDisable(): void {
        if (this.spawnIntervalId) {
            clearInterval(this.spawnIntervalId);
            this.spawnIntervalId = null;
        }
        console.log(1222222222222);

        // 停止所有动画
        this.stopAll();
    }

    public removeCarousel() {
        this.stopAll();
        this.node.removeAllChildren();
        this.itemPool = [];
    }

    // 加载远程图片
    setRemoteImage(url: string, nodeSprite: Sprite) {
        CocosUtils.loadRemoteTexture(url, nodeSprite);
    }
}