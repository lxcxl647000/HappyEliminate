import { _decorator, CCInteger, Color, Component, Label, Node, Sprite, Tween, tween, UIOpacity, UITransform, Vec2, Vec3 } from 'cc';
import PoolMgr from '../manager/PoolMgr';
import CocosUtils from '../utils/CocosUtils';
import { qc } from '../framework/qc';
import EventDef from '../constants/EventDef';
import GuideMgr, { GuideType } from '../manager/GuideMgr';
const { ccclass, property } = _decorator;

export interface IForceGuideArea {
    posOffset: Vec2;
    width: number;
    height: number;
}

export interface IGuide {
    parent: Node;
    targetNode: Node;
    targetPosOffset: Vec2;
    forceGuideArea: IForceGuideArea;
    tips: string;
    type: GuideType;
    canClickMask: boolean;
    fingerAniOffset: Vec2;
    tipsOffset: Vec2;
    doNext: Function;
}

@ccclass('Guide')
export class Guide extends Component {
    @property(Node)
    forceGuide: Node = null;
    @property(Node)
    guide: Node = null;
    @property(Node)
    finger: Node = null;
    @property(Node)
    tipsNode: Node = null;
    @property(Label)
    tipsLabel: Label = null;
    @property(Node)
    tipsNode_continue: Node = null;
    @property(Label)
    tipsLabel_continue: Label = null;
    @property(Node)
    tailNode: Node = null;
    @property(Node)
    tailVerticalNode: Node = null;
    @property(Node)
    clickCircleNode: Node = null;
    @property(Node)
    circleNode: Node = null;

    private _curGuide: IGuide = null;

    protected onEnable(): void {
        this.tipsNode_continue.active = false;
        this.tipsNode.active = false;
        this.forceGuide.active = false;
        qc.eventManager.on(EventDef.HideGuide, this._hideGuide, this);
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.HideGuide, this._hideGuide, this);
    }

    public showGuide(guide: IGuide) {
        this._curGuide = guide;
        let targetPos = CocosUtils.setNodeToTargetPos(this.guide, this._curGuide.targetNode);
        if (this._curGuide.forceGuideArea) {
            let uiTransform = this.forceGuide.getComponent(UITransform);
            uiTransform.width = this._curGuide.forceGuideArea.width
            uiTransform.height = this._curGuide.forceGuideArea.height;
            let pos = targetPos.clone();
            if (guide.forceGuideArea.posOffset) {
                pos.x += guide.forceGuideArea.posOffset.x;
                pos.y += guide.forceGuideArea.posOffset.y;
            }
            this.forceGuide.setPosition(pos);
            this.forceGuide.active = true;
        }

        if (this._curGuide.targetPosOffset) {
            targetPos.x += this._curGuide.targetPosOffset.x;
            targetPos.y += this._curGuide.targetPosOffset.y;
        }
        this.guide.setPosition(targetPos);
        if (this._curGuide.fingerAniOffset) {
            if (this._curGuide.fingerAniOffset.x !== 0) {
                this._slideAni(this._curGuide.fingerAniOffset.x, 0);
            }
            else if (this._curGuide.fingerAniOffset.y !== 0) {
                this._guideAni_y(targetPos, this._curGuide.fingerAniOffset.y);
            }
        }

        if (!this._curGuide.tips || this._curGuide.tips === '') {
            this.tipsNode_continue.active = false;
            this.tipsNode.active = false;
        }
        else {
            if (this._curGuide.canClickMask) {
                this.tipsNode_continue.active = true;
                this.tipsLabel_continue.string = this._curGuide.tips;
            }
            else {
                this.tipsNode.active = true;
                this.tipsLabel.string = this._curGuide.tips;
            }
            let tipsPos = targetPos.clone();
            if (this._curGuide.tipsOffset) {
                tipsPos.x += this._curGuide.tipsOffset.x;
                tipsPos.y += this._curGuide.tipsOffset.y;
            }
            else {
                tipsPos.y += 100;
            }
            if (this._curGuide.canClickMask) {
                this.tipsNode_continue.setPosition(tipsPos);
            }
            else {
                this.tipsNode.setPosition(tipsPos);
            }
        }
    }

    private _hideGuide(type: GuideType) {
        if (!this._curGuide) {
            this._closeGuide();
            return;
        }
        if (this._curGuide.type !== type) {
            return;
        }
        GuideMgr.ins.lastGuideType = type;
        this._closeGuide();
    }

    private _closeGuide() {
        this.forceGuide.active = false;
        Tween.stopAllByTarget(this.guide);
        PoolMgr.ins.putNodeToPool(this.node);
        let cb: Function = null;
        if (this._curGuide && this._curGuide.doNext) {
            cb = this._curGuide.doNext;
        }
        this._curGuide = null;
        cb && cb();
    }

    private _guideAni_x(pos: Vec3, offsetX: number) {
        tween(this.guide)
            .to(.7, { x: this.guide.position.x + offsetX }, { easing: 'sineInOut' })
            .call(() => {
                this.guide.setPosition(pos);
                this._guideAni_x(pos, offsetX);
            })
            .start();
    }

    private _slideAni(offsetX: number, offsetY: number) {
        this.circleNode.setScale(3, 3);
        this.circleNode.getComponent(Sprite).color.set(255, 255, 255, 0);
        this.tailNode.getComponent(Sprite).color.set(255, 255, 255, 0);
        this.tailVerticalNode.getComponent(Sprite).color.set(255, 255, 255, 0);
        this.tailNode.setScale(2, 2);
        this.tailVerticalNode.setScale(2, 2);

        let isVertical = offsetY > 0;
        this.tailNode.active = !isVertical;
        this.tailVerticalNode.active = isVertical;
        let tail = isVertical ? this.tailVerticalNode : this.tailNode;
        this.circleNode.active = true;

        //光圈
        tween(this.circleNode)
            .to(10 / 30, { scale: new Vec3(1, 1, 1) }, { easing: 'sineInOut' })
            .to(20 / 30, { scale: new Vec3(1, 1, 1) }, { easing: 'sineInOut' })
            .to(5 / 30, { scale: Vec3.ZERO }, { easing: 'sineInOut' })
            .start();
        tween(this.circleNode.getComponent(Sprite))
            .to(10 / 30, { color: new Color(255, 255, 255, 255) }, { easing: 'sineInOut' })
            .to(20 / 30, { color: new Color(255, 255, 255, 255) }, { easing: 'sineInOut' })
            .to(5 / 30, { color: new Color(255, 255, 255, 0) }, { easing: 'sineInOut' })
            .start();

        // 缩放
        tween(this.finger)
            .to(10 / 30, { scale: new Vec3(.86, .86, 1) }, { easing: 'sineInOut' })
            .to(20 / 30, { scale: new Vec3(.86, .86, 1) }, { easing: 'sineInOut' })
            .to(10 / 30, { scale: new Vec3(1, 1, 1) }, { easing: 'sineInOut' })
            .start();

        // 旋转
        tween(this.finger)
            .to(10 / 30, { eulerAngles: new Vec3(0, 0, 17) }, { easing: 'sineInOut' })
            .to(20 / 30, { eulerAngles: new Vec3(0, 0, -17) }, { easing: 'sineInOut' })
            .to(10 / 30, { eulerAngles: new Vec3(0, 0, 0) }, { easing: 'sineInOut' })
            .start();

        // 移动
        let toPos = new Vec3(isVertical ? 0 : offsetX, isVertical ? offsetY : 0, 0);
        let oriPos = Vec3.ZERO;
        this.scheduleOnce(() => {
            tween(this.finger)
                .to(20 / 30, { position: toPos }, { easing: 'sineInOut' })
                .to(20 / 30, { position: toPos }, { easing: 'sineInOut' })
                .to(10 / 30, { position: oriPos }, { easing: 'sineInOut' })
                .call(() => {
                    this._slideAni(offsetX, offsetY);
                })
                .start();

            // 拖尾
            tween(tail.getComponent(Sprite))
                .to(5 / 30, { color: new Color(255, 255, 255, 255) }, { easing: 'sineInOut' })
                .to(15 / 30, { color: new Color(255, 255, 255, 255) }, { easing: 'sineInOut' })
                .to(1 / 30, { color: new Color(255, 255, 255, 0) }, { easing: 'sineInOut' })
                .start();
            tween(tail)
                .to(20 / 30, { scale: new Vec3(1, 1, 1) }, { easing: 'sineInOut' })
                .start();
        }, 10 / 30);
    }

    private _guideAni_y(pos: Vec3, offsetY: number) {
        tween(this.guide)
            .to(.7, { y: this.guide.position.y + offsetY }, { easing: 'sineInOut' })
            .call(() => {
                this.guide.setPosition(pos);
                this._guideAni_y(pos, offsetY);
            })
            .start();
    }

    onClickMask() {
        if (!this._curGuide) {
            this._closeGuide();
            return;
        }
        if (!this._curGuide.canClickMask) {
            return;
        }
        this._closeGuide();
    }
}
