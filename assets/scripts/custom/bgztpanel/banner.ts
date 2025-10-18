import { _decorator, Component, Node, NodeEventType, CCInteger, v2, UITransform, CCFloat, Label, Layout } from 'cc';
import { qc } from '../../framework/qc';
import EventDef from '../../constants/EventDef';
import themesApi from '../../api/themes';
import CommonTipsMgr from '../../manager/CommonTipsMgr';
import PlayerMgr from '../../manager/PlayerMgr';
const { ccclass, property } = _decorator;

@ccclass('banner')
export class banner extends Component {
    @property(Label)
    btnLabel: Label = null;
    @property(Node)
    btnImgTheme: Node = null;
    @property(Label)
    titleLabel: Label = null;
    @property({
        type: CCInteger,
        range: [1, 100],
    })
    m_offset: number = 0  // 设置为0，避免额外间距

    @property({
        type: CCFloat,
        range: [1, 1.2],
    })
    m_maxScale: number = 1

    @property({
        type: CCFloat,
        range: [0.5, 1.0],
    })
    m_minScale: number = 0.9  // 调整最小缩放为0.8

    // 控制item之间的间距比例
    @property({
        type: CCFloat,
        range: [0.8, 1.0],
    })
    m_spacingRatio: number = 1.0  // 1.0表示无重叠，0.9表示有10%重叠

    m_item: any = [];
    m_startTime: any = null
    m_speed: any = null
    centering: boolean = false;
    targetX: number = 0;
    centerNode: Node = null;
    start() {

    }
    init() {
        this.scheduleOnce(() => {
            this.initItems();
            this.updateScale();
        }, 0);

        this.node.on(NodeEventType.TOUCH_START, (e) => {
            console.log('touchstart', e);
            this.m_startTime = new Date().getTime();
            this.m_speed = 0
            this.centering = false;
        }, this)

        this.node.on(NodeEventType.TOUCH_CANCEL, (e) => {
            console.log('TOUCH_CANCEL', e);
            this.centering = true;
        }, this)

        this.node.on(NodeEventType.TOUCH_MOVE, (e) => {
            let por = e.getDelta()
            this.moveX(por)
            this.updateLeftRight(-por.x)
        }, this)

        this.node.on(NodeEventType.TOUCH_END, (e) => {
            let start = e.getStartLocation()
            let curPos = e.getLocation()
            let x = start.x - curPos.x
            if (x == 0) {
                this.centering = true;
                return
            }
            let curTime = new Date().getTime()
            let t = curTime - this.m_startTime
            this.m_speed = x / t
            console.log('TOUCH_END');
        }, this)

        this.updateScale()
    }
    onEnable() {
        qc.eventManager.on(EventDef.Call_Banner, this.init, this);
        // 组件启用时重新初始化
        if (this.m_item.length === 0) {
            this.initItems();
            this.updateScale();
        }
    }
    protected onDisable(): void {
        qc.eventManager.off(EventDef.Call_Banner, this.init, this);
    }
    moveX(pos) {
        this.m_item.forEach((item) => {
            item.setPosition(item.x + pos.x, item.y)
        })
    }

    updateLeftRight(speed) {

        let startItem = this.m_item[0]
        let endItem = this.m_item[this.m_item.length - 1]

        // 使用动态计算的间距
        let itemWidth = startItem.getComponent(UITransform).width;
        let spacing = itemWidth * this.m_spacingRatio;

        if (speed > 0) {
            if (startItem.x < -itemWidth) {
                console.log(startItem.x, startItem.width);
                let item = this.m_item.shift()
                this.m_item.push(item)
                let x = endItem.x + spacing
                item.x = x
            }
        } else {
            if (endItem.x > this.node.getComponent(UITransform).width + itemWidth) {
                console.log(endItem.x, this.node.getComponent(UITransform).width);
                let item = this.m_item.pop()
                this.m_item.unshift(item)
                let x = startItem.x - spacing
                item.x = x
            }
        }
        this.updateScale()
    }

    updateScale() {
        this.m_item.forEach(item => {
            let width = this.node.getComponent(UITransform).width / 2
            let pre = item.x / width
            if (item.x > width) {
                pre = 1 - (item.x - width) / width
            }
            // 使用属性定义的缩放范围保持渐变效果
            let scale = 1.0 - 0.9
            scale *= pre
            scale += 0.9

            item.setScale(scale, scale)
        });
    }

    update(deltaTime: number) {
        if (this.m_item.length > 0) {
            if (this.m_speed == 0 && !this.centering) {
                return
            }

            if (this.centering) {
                let centerItem = this.getClosestItemToCenter();
                if (centerItem) {
                    let screenCenterX = this.node.getComponent(UITransform).width / 2;
                    let diff = screenCenterX - centerItem.x;

                    if (Math.abs(diff) < 1) {
                        this.centering = false;
                        let offset = screenCenterX - centerItem.x;
                        this.moveX(v2(offset, 0));
                        this.updateScale();

                        let finalCenterItem = this.getCenterItem();
                        if (finalCenterItem) {
                            this.onItemCentered(finalCenterItem);
                        }
                        return;
                    }

                    let moveX = diff * deltaTime * 10;
                    this.moveX(v2(moveX, 0));
                    this.updateLeftRight(-moveX);
                }
                return;
            }

            let x = this.m_speed * deltaTime * 500
            if (this.m_speed > 0) {
                this.m_speed -= deltaTime * 2
                if (this.m_speed < 0) {
                    this.m_speed = 0
                    this.centering = true;
                }
            } else {
                this.m_speed += deltaTime * 2
                if (this.m_speed > 0) {
                    this.m_speed = 0
                    this.centering = true;
                }
            }

            this.moveX(v2(-x, 0))
            this.updateLeftRight(x)
        }

    }

    getClosestItemToCenter(): Node | null {
        let screenCenterX = this.node.getComponent(UITransform).width / 2;
        let closestItem: Node | null = null;
        let minDistance = Infinity;

        this.m_item.forEach((item: Node) => {
            let distance = Math.abs(item.x - screenCenterX);
            if (distance < minDistance) {
                minDistance = distance;
                closestItem = item;
            }
        });

        return closestItem;
    }

    getCenterItem(): Node | null {
        let screenCenterX = this.node.getComponent(UITransform).width / 2;

        for (let i = 0; i < this.m_item.length; i++) {
            let item = this.m_item[i];
            if (Math.abs(item.x - screenCenterX) < 1) {
                return item;
            }
        }

        return null;
    }

    onItemCentered(centeredItem: Node) {
        this.centerNode = centeredItem
        console.log("Item centered:", centeredItem['bg_id']);
        if (centeredItem['title_name']) {
            this.titleLabel.string = centeredItem['title_name']
            if (centeredItem['owned'] == 1) {
                this.btnImgTheme.active = false
                this.btnLabel.string = '立即使用'
               
            } else {
                this.btnImgTheme.active = true
                this.btnLabel.string = '100碎片兑换'
              
            }
        }


    }
    initItems() {
        this.node.children.forEach((item: Node, index) => {
            let itemWidth = item.getComponent(UITransform).width;
            item.x = index * itemWidth * this.m_spacingRatio;

            item.y = 0;
            item.getComponent(UITransform).anchorX = 0.5;
            this.m_item.push(item);
        });
    }
    submitClick() {
        if (this.centerNode['owned'] == 1) {
            themesApi.ins.themeUse({ theme_id: this.centerNode['bg_id'] }).then((res) => {
                if (res.code == 200) {
                    CommonTipsMgr.ins.showTips(res.msg);
                    PlayerMgr.ins.userInfo.summary.current_theme_id = this.centerNode['bg_id']
                }
            })
        } else {
            themesApi.ins.themeExchange({ theme_id: this.centerNode['bg_id'] }).then((res) => {
                if (res.code == 200) {
                    CommonTipsMgr.ins.showTips(res.msg);
                    qc.eventManager.emit(EventDef.Update_Theme_Clips)
                }
            })
        }
    }
}