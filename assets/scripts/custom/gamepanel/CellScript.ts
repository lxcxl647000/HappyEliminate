import { _decorator, Animation, Component, EventTouch, Input, instantiate, Node, Prefab, Sprite, SpriteFrame, tween, UITransform, Vec2, Vec3 } from 'cc';
import { CellType } from '../../game/Types';
import { ToolType } from '../../game/tools/ITool';
import { Constants } from '../../game/Constants';
import CocosUtils from '../../utils/CocosUtils';
import PoolMgr from '../../manager/PoolMgr';
import { BundleConfigs } from '../../configs/BundleConfigs';
const { ccclass, property } = _decorator;

// 描述Cell中Node的状态
export enum CellNodeStatus {
    INVALID = 0,
    MOVE_START = 1,
    MOVEING,
    MOVE_FINISH,
    REMOVE_START,
    REMOVING,
    REMOVE_FINISH
}

export interface OnCellNodeTouchListener {
    onClick: (node: Node) => void;
    // 朝向一个方法滑动
    onMoveDirection: (node: Node, dir: Vec2) => void;
}

@ccclass('CellScript')
export class CellScript extends Component {
    @property(Prefab)
    explosionPrefab: Prefab;
    @property(Prefab)
    disappearLightPrefab: Prefab;
    @property(Node)
    cellBgLight: Node;

    @property([SpriteFrame])
    spriteFrameList: SpriteFrame[] = new Array<SpriteFrame>();

    @property([SpriteFrame])
    toolSpriteFrameList: SpriteFrame[] = new Array<SpriteFrame>();

    sprite: Sprite;
    textureConfg: Map<CellType, { sprite: SpriteFrame, name: string }>;
    toolTextureConfig: Map<ToolType, { sprite: SpriteFrame }>;

    cellType: CellType = CellType.INVALID;

    // 当前的状态
    cellStatus: CellNodeStatus = CellNodeStatus.INVALID;

    // pos, node动画完成之后的位置
    // 记录进行判断, 避免动画重复执行
    pos: Vec3;

    // click listener
    clickListener: OnCellNodeTouchListener;

    // 是否为选中
    selected: boolean = false;

    // 是否是一个 道具
    private toolType: ToolType = ToolType.INVALID;

    // 是否初始化
    private inited: boolean = false;

    private _playDisappearAni = false;

    private checkInit() {
        if (!this.inited) {
            this.inited = true;
            // this.sprite = this.getComponent(Sprite);
            let icon = this.node.getChildByName('icon');
            this.sprite = icon ? icon.getComponent(Sprite) : this.getComponent(Sprite);

            this.textureConfg = new Map<CellType, { sprite: SpriteFrame, name: string }>();
            this.textureConfg[CellType.TYPE_1] = { sprite: this.spriteFrameList[0], name: this.spriteFrameList[0].name };
            this.textureConfg[CellType.TYPE_2] = { sprite: this.spriteFrameList[1], name: this.spriteFrameList[1].name };
            this.textureConfg[CellType.TYPE_3] = { sprite: this.spriteFrameList[2], name: this.spriteFrameList[2].name };
            this.textureConfg[CellType.TYPE_4] = { sprite: this.spriteFrameList[3], name: this.spriteFrameList[3].name };
            // this.textureConfg[CellType.TYPE_5] = { sprite: this.spriteFrameList[4], name: this.spriteFrameList[4].name };

            this.textureConfg[CellType.INVALID] = { sprite: undefined, name: undefined };

            this.toolTextureConfig = new Map<ToolType, { sprite: SpriteFrame, name: string }>();
            this.toolTextureConfig.set(ToolType.BOOM_MATCH, { sprite: this.toolSpriteFrameList[0] });
            this.toolTextureConfig.set(ToolType.BOOM_UP_MATCH, { sprite: this.toolSpriteFrameList[1] });
            this.toolTextureConfig.set(ToolType.ROW_MATCH, { sprite: this.toolSpriteFrameList[2] });
            this.toolTextureConfig.set(ToolType.COL_MATCH, { sprite: this.toolSpriteFrameList[3] });
            this.toolTextureConfig.set(ToolType.TYPE_MATCH, { sprite: this.toolSpriteFrameList[4] });

        }
    }
    onLoad() {
        this.checkInit();
    }

    start() {
        this.node.on(Input.EventType.TOUCH_START, this.onTouch, this);
        // this.node.on(Input.EventType.TOUCH_MOVE, this.onTouch, this);
        this.node.on(Input.EventType.TOUCH_END, this.onTouch, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouch, this);
    }

    update(deltaTime: number) {

    }

    setOnClickListener(clickListener: OnCellNodeTouchListener) {
        this.clickListener = clickListener;
    }

    touchingID: number = 0;
    onTouch(evt: EventTouch) {
        if (this.cellType === CellType.INVALID) {
            return;
        }
        if (!this.clickListener) {
            return;
        }
        const touch = evt.touch;
        const tid = touch.getID();
        const touchingID = this.touchingID;

        if (evt.type === Node.EventType.TOUCH_START) {
            // 开始触摸
            if (touchingID) {
                return;
            }
            this.touchingID = tid;
        } else {
            // 结束触摸
            if (touchingID && touchingID !== tid) return; // 不是正触摸的点，忽略之
            // 得到滑动向量
            const vec = touch.getLocation().subtract(touch.getStartLocation());
            if (vec.lengthSqr() < 10) {
                // 滑动距离太短，可认为是点击
                if (this.clickListener) {
                    this.clickListener.onClick(this.node);
                    // 不支持选中的，不需要显示选中
                    // this.setSelect(true);
                }
            } else {
                // 得到滑动的方向
                // 右：(1, 0)
                // 左：(-1, 0)
                // 上：(0, 1)
                // 下：(0, -1)
                const dir = this.getVecDir(vec);
                if (this.clickListener) {
                    this.clickListener.onMoveDirection(this.node, dir);
                    // this.setSelect(true);
                }
            }

            this.touchingID = 0; // 注意有this.
        }
    }

    private getVecDir(vec: Vec2): Vec2 {
        const RIGHT = new Vec2(1, 0);
        const LEFT = new Vec2(-1, 0);
        const UP = new Vec2(0, 1);
        const DOWN = new Vec2(0, -1);

        if (Math.abs(vec.x) > Math.abs(vec.y)) {
            // 水平滑动
            if (vec.x > 0) {
                // 右
                return RIGHT;
            } else {
                // 左（即右的取反）
                return LEFT;
            }
        } else {
            // 垂直滑动
            if (vec.y > 0) {
                // 上
                return UP;
            } else {
                // 下
                return DOWN;
            }
        }
    }

    // 消失动画,动画执行完毕后，移除node
    disappearAnimate(onComplete?: () => void) {
        this.cellStatus = CellNodeStatus.REMOVE_START;
        let spriteNode = this.node.getChildByName('icon');
        if (!spriteNode) {
            spriteNode = this.node;
        }

        if (this.disappearLightPrefab) {
            this.scheduleOnce(() => {
                let lightNode = instantiate(this.disappearLightPrefab);
                this.node.addChild(lightNode);
            }, Constants.CELL_DISAPPEAR_LIGHT_DELAY);
        }

        if (this._playDisappearAni) {
            this._playDisappearAni = false;
            this.cellStatus = CellNodeStatus.REMOVE_FINISH;
            if (onComplete) {
                onComplete();
            }
            // 动画完成就移除自己
            this.node.removeFromParent();
            return;
        }
        tween(spriteNode)
            .call(() => {
                this.cellStatus = CellNodeStatus.REMOVING;
                // let explosionNode = instantiate(this.explosionPrefab);
                // this.node.addChild(explosionNode);
            })
            .to(Constants.CELL_DISAPPEAR_DURATION, { scale: new Vec3(1, 1, 1) })
            .to(Constants.CELL_DISAPPEAR_DURATION, { scale: new Vec3(1.2, 1.2, 1) })
            .to(Constants.CELL_DISAPPEAR_DURATION, { scale: new Vec3(0, 0, 1) })
            .call(() => {
                this.cellStatus = CellNodeStatus.REMOVE_FINISH;
                if (onComplete) {
                    onComplete();
                }
                // 动画完成就移除自己
                this.scheduleOnce(() => {
                    this.node.removeFromParent();
                }, Constants.CELL_DISAPPEAR_LIGHT_DELAY);
            })
            .start()
            .removeSelf();
    }

    isAnimating(): boolean {
        return this.cellStatus === CellNodeStatus.MOVEING || this.cellStatus === CellNodeStatus.REMOVING;
    }

    getCellNodeStatus(): CellNodeStatus {
        return this.cellStatus;
    }

    setPosition(x: number, y: number, isAnimate: boolean, onComplete?: () => void) {
        if (!this.pos) {
            this.pos = new Vec3(x, y, 0);
        } else if (this.pos.x === x && this.pos.y === y) {
            // 避免重复设置动画
            return;
        }
        this.pos.x = x;
        this.pos.y = y;

        if (isAnimate) {
            this.cellStatus = CellNodeStatus.MOVE_START;
            tween(this.node)
                .call(() => {
                    this.cellStatus = CellNodeStatus.MOVEING;
                })
                .to(Constants.CELL_DROP_DURATION, { position: new Vec3(x, y, 0) })
                .call(() => {
                    this.cellStatus = CellNodeStatus.MOVE_FINISH;
                    if (onComplete) {
                        onComplete();
                    }
                })
                .start();
        } else {
            this.cellStatus = CellNodeStatus.MOVE_START;
            this.cellStatus = CellNodeStatus.MOVEING;
            this.node.setPosition(x, y);
            this.cellStatus = CellNodeStatus.MOVE_FINISH;
            if (onComplete) {
                onComplete();
            }
        }
    }

    isValidType(): boolean {
        return this.cellType !== CellType.INVALID;
    }

    /**
     * 移除Cell
     */
    disappear(onComplete?: () => void): boolean {
        if (this.cellType !== CellType.INVALID) {
            this.cellType = CellType.INVALID;
            this.disappearAnimate(onComplete);
            return true;
        }
        if (onComplete) {
            onComplete();
        }
        return false;
    }

    /**
     * 移动到指定的位置，再移除
     * @param onComplete 
     * @returns 
     */
    moveAndDisappear(targetPos: Vec3, onComplete?: () => void): boolean {
        tween(this.node)
            .call(() => {
                this.cellStatus = CellNodeStatus.REMOVING;
            })
            .to(Constants.CELL_MOVE_TO_GOAL_DURATION, { position: targetPos })
            .call(() => {
                this.cellStatus = CellNodeStatus.REMOVE_FINISH;
                // 动画完成就移除自己
                this.node.removeFromParent();
                if (onComplete) {
                    onComplete();
                }
            })
            .start();
        return true;
    }

    /**
     * 修改类型
     * @param cellType 
     * @returns 返回false表示node会被移除 
     */
    setType(cellType: CellType): boolean {
        this.checkInit();
        if (this.cellType === cellType) {
            return true;
        }
        if (cellType == CellType.INVALID) {
            // 表示要消除
            this.disappearAnimate();
            return false;
        }

        this.cellType = cellType;
        if (!(this.cellType in this.textureConfg)) {
            console.log("invalid cell type, no config atlas ", cellType, this.textureConfg.size)
            // 需要隐藏是会设置成undefine
            this.sprite.spriteFrame = undefined;
        } else {
            if (this.textureConfg[this.cellType]) {
                this.sprite.spriteFrame = this.textureConfg[this.cellType].sprite;
            } else {
                this.sprite.spriteFrame = undefined;
            }
        }
        return true;

    }

    /**
     * 设置是否为选中
     * @param flag 
     */
    setSelect(flag: boolean) {
        if (this.selected === flag) {
            return;
        }
        this.selected = flag;
        let selectedNode = this.node.getChildByName("SelectedSprite");
        selectedNode.active = this.selected;
    }

    setRowAnimation() {

    }

    /**
     * 设置道具类型, 可能会修改图标
     * @param type 
     */
    setToolType(type: ToolType) {
        this.toolType = type;
        if (this.toolType !== ToolType.INVALID) {
            // 修改图标，或者开启动画
            if (this.toolTextureConfig.has(this.toolType)) {
                this.sprite.spriteFrame = this.toolTextureConfig.get(this.toolType).sprite;
            } else {
                // animation??
            }
        }
    }

    public playScaleAnimation() {
        let ani = this.node.getComponent(Animation);
        if (ani) {
            ani.play('cellScale');
        }
    }

    public activeBgLight() {
        if (this.cellBgLight) {
            this.cellBgLight.active = true;
        }
    }

    public hideBgLight() {
        if (this.cellBgLight) {
            let ani = this.cellBgLight.getComponent(Animation);
            if (ani) {
                ani.play('bgLight_disappear');
            }
        }
    }

    // rowmatchtool//
    public playRowMatchAnimation(cb: Function) {
        this._playDisappearAni = true;
        let ani = this.node.getComponent(Animation);
        if (ani) {
            ani.once(Animation.EventType.FINISHED, () => {
                cb && cb();
            });
            ani.play('rowMatch');
        }
    }

    public rowLineLightAni(cb: Function) {
        PoolMgr.ins.getNodeFromPool(BundleConfigs.gameBundle, 'prefabs/RowLineLight', (line: Node) => {
            line.parent = this.node.parent;
            line.setPosition(this.node.position);
            let ani = line.getComponent(Animation);
            if (ani) {
                ani.once(Animation.EventType.FINISHED, () => {
                    PoolMgr.ins.putNodeToPool(line);
                });
                ani.play();
                cb && cb();
            }
        });
    }

    // colmatchtool//
    public playColMatchAnimation(cb: Function) {
        this._playDisappearAni = true;
        let ani = this.node.getComponent(Animation);
        if (ani) {
            ani.once(Animation.EventType.FINISHED, () => {
                cb && cb();
            });
            ani.play('colMatch');
        }
    }

    public colLineLightAni(cb: Function) {
        PoolMgr.ins.getNodeFromPool(BundleConfigs.gameBundle, 'prefabs/ColLineLight', (line: Node) => {
            line.parent = this.node.parent;
            line.setPosition(this.node.position);
            let ani = line.getComponent(Animation);
            if (ani) {
                ani.once(Animation.EventType.FINISHED, () => {
                    PoolMgr.ins.putNodeToPool(line);
                });
                ani.play();
                cb && cb();
            }
        });
    }

    // boommatchtool//
    public playBoomMatchAnimation(cb: Function) {
        this._playDisappearAni = true;
        let ani = this.node.getComponent(Animation);
        if (ani) {
            ani.once(Animation.EventType.FINISHED, () => {
                cb && cb();
            });
            ani.play('boomMatch');
        }
    }

    public boomLightAni(cb: Function) {
        PoolMgr.ins.getNodeFromPool(BundleConfigs.gameBundle, 'prefabs/BoomLight', (boom: Node) => {
            boom.parent = this.node.parent;
            boom.setPosition(this.node.position);
            let ani = boom.getComponent(Animation);
            if (ani) {
                ani.once(Animation.EventType.FINISHED, () => {
                    PoolMgr.ins.putNodeToPool(boom);
                });
                ani.play();
                setTimeout(() => {
                    cb && cb();
                }, (6 / 30) * 1000);
            }
        });
    }
}


