import { _decorator, Color, Component, Label, Node, Sprite, Tween, tween, UITransform, Vec2, Vec3 } from 'cc';
import PoolMgr from '../manager/PoolMgr';
import CocosUtils from '../utils/CocosUtils';
import { qc } from '../framework/qc';
import EventDef from '../constants/EventDef';
import GuideMgr, { GuideType } from '../manager/GuideMgr';
import { GamePanel } from '../custom/gamepanel/GamePanel';
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
    isSlide: boolean;
    slideTipsOffset: Vec2;
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
    clickCircleNode2: Node = null;
    @property(Node)
    circleNode: Node = null;
    @property(Node)
    slideTipsNode: Node = null;
    @property(Node)
    useHammerTipsNode: Node = null;

    private _curGuide: IGuide = null;

    protected onEnable(): void {
        this.useHammerTipsNode.active = false;
        this.slideTipsNode.active = false;
        this.tipsNode_continue.active = false;
        this.tipsNode.active = false;
        this.forceGuide.active = false;
        this.circleNode.active = false;
        this.clickCircleNode.active = false;
        this.clickCircleNode2.active = false;
        this.tailNode.active = false;
        this.tailVerticalNode.active = false;
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
            if (this._curGuide.isSlide) {
                this._slideAni(this._curGuide.fingerAniOffset.x, this._curGuide.fingerAniOffset.y);
            }
            else {
                this._clickAni();
            }
        }

        if (this._curGuide.slideTipsOffset) {
            let slidePos = targetPos.clone();
            slidePos.x = targetPos.x + this._curGuide.slideTipsOffset.x;
            slidePos.y = targetPos.y + this._curGuide.slideTipsOffset.y;
            this.slideTipsNode.setPosition(slidePos);
            this.slideTipsNode.active = true;
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

        if (this._curGuide.type === GuideType.Force_Level_1_Use_Hammer) {
            let gamePanel = this.node.parent.getComponent(GamePanel);
            if (gamePanel) {
                gamePanel.setUseHammerGuideTips(this.useHammerTipsNode);
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
        this.finger.setPosition(0, 0, 0);
        this._stopAllTween();
        PoolMgr.ins.putNodeToPool(this.node);
        let cb: Function = null;
        if (this._curGuide && this._curGuide.doNext) {
            cb = this._curGuide.doNext;
        }
        this._curGuide = null;
        cb && cb();
    }

    private _stopAllTween() {
        Tween.stopAllByTarget(this.guide);
        Tween.stopAllByTarget(this.finger);
        Tween.stopAllByTarget(this.circleNode);
        Tween.stopAllByTarget(this.circleNode.getComponent(Sprite));
        Tween.stopAllByTarget(this.tailNode);
        Tween.stopAllByTarget(this.tailNode.getComponent(Sprite));
        Tween.stopAllByTarget(this.tailVerticalNode);
        Tween.stopAllByTarget(this.tailVerticalNode.getComponent(Sprite));
        Tween.stopAllByTarget(this.clickCircleNode);
        Tween.stopAllByTarget(this.clickCircleNode.getComponent(Sprite));
        Tween.stopAllByTarget(this.clickCircleNode2);
        Tween.stopAllByTarget(this.clickCircleNode2.getComponent(Sprite));
    }

    private _slideAni(offsetX: number, offsetY: number) {
        this._stopAllTween();
        this.circleNode.setScale(3, 3);
        this.circleNode.getComponent(Sprite).color.set(255, 255, 255, 0);
        this.tailNode.getComponent(Sprite).color.set(255, 255, 255, 0);
        this.tailVerticalNode.getComponent(Sprite).color.set(255, 255, 255, 0);
        this.tailNode.setScale(2, 2);
        this.tailVerticalNode.setScale(2, 2);
        this.finger.setPosition(0, 0, 0);

        let isVertical = offsetY !== 0;
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

    private _clickAni() {
        this._stopAllTween();
        this.clickCircleNode.setScale(1, 1);
        this.clickCircleNode2.setScale(1, 1);
        this.finger.setPosition(0, 0, 0);
        this.clickCircleNode.getComponent(Sprite).color.set(255, 255, 255, 0);
        this.clickCircleNode2.getComponent(Sprite).color.set(255, 255, 255, 0);

        this.clickCircleNode.active = true;
        this.clickCircleNode2.active = true;

        // 手指位置
        tween(this.finger)
            .to(10 / 30, { position: new Vec3(-40, 45, 0) }, { easing: 'sineInOut' })
            .to(25 / 30, { position: new Vec3(-40, 45, 0) }, { easing: 'sineInOut' })
            .to(10 / 30, { position: Vec3.ZERO }, { easing: 'sineInOut' })
            .to(10 / 30, { position: Vec3.ZERO }, { easing: 'sineInOut' })
            .call(() => {
                this._clickAni();
            })
            .start();

        this.scheduleOnce(() => {
            // 手指缩放
            tween(this.finger)
                .to(10 / 30, { scale: new Vec3(.9, .9, 1) }, { easing: 'sineInOut' })
                .to(10 / 30, { scale: new Vec3(1, 1, 1) }, { easing: 'sineInOut' })
                .start();
            // 手指旋转
            tween(this.finger)
                .to(10 / 30, { eulerAngles: new Vec3(0, 0, 15) }, { easing: 'sineInOut' })
                .to(10 / 30, { eulerAngles: Vec3.ZERO }, { easing: 'sineInOut' })
                .start();
        }, 10 / 30);

        this.scheduleOnce(() => {
            // 点击光圈1 透明度
            tween(this.clickCircleNode.getComponent(Sprite))
                .to(1 / 30, { color: new Color(255, 255, 255, 255) }, { easing: 'sineInOut' })
                .to(15 / 30, { color: new Color(255, 255, 255, 0) }, { easing: 'sineInOut' })
                .start();
        }, 19 / 30);

        this.scheduleOnce(() => {
            // 点击光圈1 缩放
            tween(this.clickCircleNode)
                .to(10 / 30, { scale: new Vec3(3.6, 3.6, 1) }, { easing: 'sineInOut' })
                .start();
        }, 20 / 30);

        this.scheduleOnce(() => {
            // 点击光圈2 透明度
            tween(this.clickCircleNode.getComponent(Sprite))
                .to(1 / 30, { color: new Color(255, 255, 255, 255) }, { easing: 'sineInOut' })
                .to(15 / 30, { color: new Color(255, 255, 255, 0) }, { easing: 'sineInOut' })
                .start();
        }, 24 / 30);

        this.scheduleOnce(() => {
            // 点击光圈2 缩放
            tween(this.clickCircleNode)
                .to(10 / 30, { scale: new Vec3(3, 3, 1) }, { easing: 'sineInOut' })
                .start();
        }, 25 / 30);
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
