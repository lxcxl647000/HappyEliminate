import { _decorator, Animation, Component, EventTouch, Input, instantiate, Node, Prefab, Sprite, SpriteFrame, tween, UITransform, Vec2, Vec3 } from 'cc';
import { BlockType, GameConstant, ToolType } from '../../game/GameConstant';
import PoolMgr from '../../manager/PoolMgr';
import { BundleConfigs } from '../../configs/BundleConfigs';
const { ccclass, property } = _decorator;

// 描adfas述Block中Node的adfa状态
export enum BlockNodeStatus {
    INVALID = 0,
    MoveStart = 1,
    Moving,
    MoveEnd,
    RemoveStart,
    Removing,
    RemoveEnd
}

export interface BlockTouchListener {
    onClick: (node: Node) => void;
    onMoveDir: (node: Node, dir: Vec2) => void;
}

@ccclass('BlockComponent')
export class BlockComponent extends Component {
    @property(Prefab)
    disappearPrefab: Prefab;
    @property(Node)
    blockBgLight: Node;
    @property([SpriteFrame])
    blockIcons: SpriteFrame[] = new Array<SpriteFrame>();
    @property([SpriteFrame])
    toolIcons: SpriteFrame[] = new Array<SpriteFrame>();

    iconSprite: Sprite;
    blockIconMaps: Map<BlockType, { sprite: SpriteFrame, name: string }>;
    toolIconMaps: Map<ToolType, { sprite: SpriteFrame }>;
    blockType: BlockType = BlockType.INVALID;
    // 当前的adfa状态
    blockStatus: BlockNodeStatus = BlockNodeStatus.INVALID;

    // pos, node动画完成之后sasdfasf的位置
    // 记录进asdfa行判断, 避免动画重adfasf复执行
    pos: Vec3;
    // click listener fadsfa 
    clickListener: BlockTouchListener;
    // 是否adfa为选中
    isSelected: boolean = false;
    // 是否初adfa始化
    private _isInited: boolean = false;
    private _playDisappearAni = false;
    // 是否是adfa一个 道asdf a具
    private toolType: ToolType = ToolType.INVALID;
    public getToolType() {
        return this.toolType;
    }

    private _checkIsInit() {
        if (!this._isInited) {
            this._isInited = true;
            let icon = this.node.getChildByName('icon');
            this.iconSprite = icon ? icon.getComponent(Sprite) : this.getComponent(Sprite);

            this.blockIconMaps = new Map<BlockType, { sprite: SpriteFrame, name: string }>();
            this.blockIconMaps[BlockType.Type1] = { sprite: this.blockIcons[0], name: this.blockIcons[0].name };
            this.blockIconMaps[BlockType.Type2] = { sprite: this.blockIcons[1], name: this.blockIcons[1].name };
            this.blockIconMaps[BlockType.Type3] = { sprite: this.blockIcons[2], name: this.blockIcons[2].name };
            this.blockIconMaps[BlockType.Type4] = { sprite: this.blockIcons[3], name: this.blockIcons[3].name };

            this.blockIconMaps[BlockType.INVALID] = { sprite: undefined, name: undefined };

            this.toolIconMaps = new Map<ToolType, { sprite: SpriteFrame, name: string }>();
            this.toolIconMaps.set(ToolType.BoomInGrid, { sprite: this.toolIcons[0] });
            this.toolIconMaps.set(ToolType.Row, { sprite: this.toolIcons[1] });
            this.toolIconMaps.set(ToolType.Col, { sprite: this.toolIcons[2] });
            this.toolIconMaps.set(ToolType.TypeMatch, { sprite: this.toolIcons[3] });
        }
    }
    onLoad() {
        this._checkIsInit();
    }

    start() {
        this.node.on(Input.EventType.TOUCH_START, this.onTouch, this);
        this.node.on(Input.EventType.TOUCH_END, this.onTouch, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouch, this);
    }

    setClick(clickListener: BlockTouchListener) {
        this.clickListener = clickListener;
    }

    private _touchingID: number = 0;
    onTouch(evt: EventTouch) {
        if (this.blockType === BlockType.INVALID) {
            return;
        }
        if (!this.clickListener) {
            return;
        }
        const touch = evt.touch;
        const tid = touch.getID();
        const touchingID = this._touchingID;

        if (evt.type === Node.EventType.TOUCH_START) {
            if (touchingID) {
                return;
            }
            this._touchingID = tid;
        } else {
            if (touchingID && touchingID !== tid) return;
            const vec = touch.getLocation().subtract(touch.getStartLocation());
            if (vec.lengthSqr() < 10) {
                if (this.clickListener) {
                    this.clickListener.onClick(this.node);
                }
            } else {
                const dir = this.getVecDir(vec);
                if (this.clickListener) {
                    this.clickListener.onMoveDir(this.node, dir);
                }
            }
            this._touchingID = 0;
        }
    }

    private getVecDir(vec: Vec2): Vec2 {
        const RIGHT = new Vec2(1, 0);
        const LEFT = new Vec2(-1, 0);
        const UP = new Vec2(0, 1);
        const DOWN = new Vec2(0, -1);

        if (Math.abs(vec.x) > Math.abs(vec.y)) {
            if (vec.x > 0) {
                return RIGHT;
            } else {
                return LEFT;
            }
        } else {
            if (vec.y > 0) {
                return UP;
            } else {
                return DOWN;
            }
        }
    }

    disappearAnimate(onComplete?: () => void) {
        this.blockStatus = BlockNodeStatus.RemoveStart;
        let spriteNode = this.node.getChildByName('icon');
        if (!spriteNode) {
            spriteNode = this.node;
        }

        if (this.disappearPrefab) {
            this.scheduleOnce(() => {
                let lightNode = instantiate(this.disappearPrefab);
                this.node.addChild(lightNode);
            }, GameConstant.DisappearLigthDelay);
        }

        if (this._playDisappearAni) {
            this._playDisappearAni = false;
            this.blockStatus = BlockNodeStatus.RemoveEnd;
            if (onComplete) {
                onComplete();
            }
            this.node.removeFromParent();
            return;
        }
        tween(spriteNode)
            .call(() => {
                this.blockStatus = BlockNodeStatus.Removing;
            })
            .to(GameConstant.DisappearTime, { scale: new Vec3(1, 1, 1) })
            .to(GameConstant.DisappearTime, { scale: new Vec3(1.2, 1.2, 1) })
            .to(GameConstant.DisappearTime, { scale: new Vec3(0, 0, 1) })
            .call(() => {
                this.blockStatus = BlockNodeStatus.RemoveEnd;
                if (onComplete) {
                    onComplete();
                }
                this.scheduleOnce(() => {
                    this.node.removeFromParent();
                }, GameConstant.DisappearLigthDelay);
            })
            .start()
            .removeSelf();
    }

    isAnimating(): boolean {
        return this.blockStatus === BlockNodeStatus.Moving || this.blockStatus === BlockNodeStatus.Removing;
    }

    getBlockNodeStatus(): BlockNodeStatus {
        return this.blockStatus;
    }

    setPosition(x: number, y: number, isAnimate: boolean, onComplete?: Function) {
        if (!this.pos) {
            this.pos = new Vec3(x, y, 0);
        } else if (this.pos.x === x && this.pos.y === y) {
            return;
        }
        this.pos.x = x;
        this.pos.y = y;

        if (isAnimate) {
            this.blockStatus = BlockNodeStatus.MoveStart;
            tween(this.node)
                .call(() => {
                    this.blockStatus = BlockNodeStatus.Moving;
                })
                .to(GameConstant.DropTime, { position: new Vec3(x, y, 0) })
                .call(() => {
                    this.blockStatus = BlockNodeStatus.MoveEnd;
                    if (onComplete) {
                        onComplete();
                    }
                })
                .start();
        } else {
            this.blockStatus = BlockNodeStatus.MoveStart;
            this.blockStatus = BlockNodeStatus.Moving;
            this.node.setPosition(x, y);
            this.blockStatus = BlockNodeStatus.MoveEnd;
            if (onComplete) {
                onComplete();
            }
        }
    }

    isValidType(): boolean {
        return this.blockType !== BlockType.INVALID;
    }

    disappear(onComplete?: () => void): boolean {
        if (this.blockType !== BlockType.INVALID) {
            this.blockType = BlockType.INVALID;
            this.disappearAnimate(onComplete);
            return true;
        }
        if (onComplete) {
            onComplete();
        }
        return false;
    }

    moveAndDisappear(targetPos: Vec3, onComplete?: () => void): boolean {
        tween(this.node)
            .call(() => {
                this.blockStatus = BlockNodeStatus.Removing;
            })
            .to(GameConstant.ToTargetTime, { position: targetPos })
            .call(() => {
                this.blockStatus = BlockNodeStatus.RemoveEnd;
                // 动画完成就移除自己
                this.node.removeFromParent();
                if (onComplete) {
                    onComplete();
                }
            })
            .start();
        return true;
    }

    setType(blockType: BlockType): boolean {
        this._checkIsInit();
        if (this.blockType === blockType) {
            return true;
        }
        if (blockType == BlockType.INVALID) {
            // 表示要消除
            this.disappearAnimate();
            return false;
        }

        this.blockType = blockType;
        if (!(this.blockType in this.blockIconMaps)) {
            this.iconSprite.spriteFrame = undefined;
        } else {
            if (this.blockIconMaps[this.blockType]) {
                this.iconSprite.spriteFrame = this.blockIconMaps[this.blockType].sprite;
            } else {
                this.iconSprite.spriteFrame = undefined;
            }
        }
        return true;

    }

    /**
     * 设置是否为选中
     * @param flag 
     */
    setSelect(flag: boolean) {
        if (this.isSelected === flag) {
            return;
        }
        this.isSelected = flag;
        let selectedNode = this.node.getChildByName("SelectedSprite");
        selectedNode.active = this.isSelected;
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
            if (this.toolIconMaps.has(this.toolType)) {
                this.iconSprite.spriteFrame = this.toolIconMaps.get(this.toolType).sprite;
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
        if (this.blockBgLight) {
            this.blockBgLight.active = true;
        }
    }

    public hideBgLight() {
        if (this.blockBgLight) {
            let ani = this.blockBgLight.getComponent(Animation);
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

    // typematchtool//
    public playTypeMatchAnimation(cb: Function, aniName: string) {
        this._playDisappearAni = true;
        let ani = this.node.getComponent(Animation);
        if (ani) {
            ani.once(Animation.EventType.FINISHED, () => {
                cb && cb();
            });
            ani.play(aniName);
        }
    }

    public typeLightAni(cb: Function) {
        PoolMgr.ins.getNodeFromPool(BundleConfigs.gameBundle, 'prefabs/CandyLight', (candy: Node) => {
            candy.parent = this.node.parent;
            candy.setSiblingIndex(this.node.getSiblingIndex() - 1);
            candy.setPosition(this.node.position);
            let ani = candy.getComponent(Animation);
            if (ani) {
                ani.once(Animation.EventType.FINISHED, () => {
                    PoolMgr.ins.putNodeToPool(candy);
                });
                ani.play();
                setTimeout(() => {
                    cb && cb();
                }, (25 / 30) * 1000);
            }
        });
    }
}


