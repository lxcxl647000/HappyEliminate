import { _decorator, CCInteger, Component, Label, Node, Tween, tween, UITransform, Vec2, Vec3 } from 'cc';
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
    tipsNode: Node = null;
    @property(Label)
    tipsLabel: Label = null;
    @property(Node)
    tipsNode_continue: Node = null;
    @property(Label)
    tipsLabel_continue: Label = null;

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
                this._guideAni_x(targetPos, this._curGuide.fingerAniOffset.x);
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
