import { Node, UITransform, Vec2 } from "cc";
import { Cell } from "../game/Types";
import PoolMgr from "./PoolMgr";
import { BundleConfigs } from "../configs/BundleConfigs";
import { Guide, IGuide } from "../commonTs/Guide";
import { ItemType } from "../configs/ItemConfig";
import PlayerMgr from "./PlayerMgr";

export enum GuideType {
    Invalid = 0,
    // 第1关强制合成
    Force_Level_1_Eliminate = 1,
    // 第1关强制选择锤子
    Force_Level_1_Select_Hammer,
    // 第1关强制使用锤子
    Force_Level_1_Use_Hammer,
    // 第1关强制选择炸弹
    Force_Level_1_Select_Boom,
    // 第1关强制使用炸弹
    Force_Level_1_Use_Boom,
    // 第1关强制看通关目标
    Force_Level_1_Pass_Target,
    // 第1关强制看通关目标
    Force_Level_1_Left_Steps,
    // 第2关强制合成
    Force_Level_2_Eliminate,
    // 第2关强制使用竖消除
    Force_Level_2_Use_ColMatch,
    // 第3关强制合成
    Force_Level_3_Eliminate,
    // 第3关强制使用炸弹消除
    Force_Level_3_Use_Boom,
}
export default class GuideMgr {

    private static _ins: GuideMgr = null;
    public static get ins() {
        if (this._ins == null) {
            this._ins = new GuideMgr();
        }
        return this._ins;
    }

    public lastGuideType: GuideType = GuideType.Invalid;

    private _createGuide(guideInfo: IGuide) {
        PoolMgr.ins.getNodeFromPool(BundleConfigs.commonBundle, 'prefabs/guideTmp', (node: Node) => {
            guideInfo.parent.addChild(node);
            let guide: Guide = node.getComponent(Guide);
            if (guide) {
                guide.showGuide(guideInfo);
            }
        });
    }

    public checkGuide(guideType: GuideType) {
        let current_level = PlayerMgr.ins.userInfo.current_level;
        if (current_level.length >= 3) {
            return false;
        }
        // 在第1关的引导中
        if (current_level.length === 0) {
            return true;
        }
        // 在第2关的引导中
        else if (current_level.length === 1) {
            if (this.lastGuideType === GuideType.Invalid) {
                this.lastGuideType = GuideType.Force_Level_1_Left_Steps;
            }
        }
        // 在第3关的引导中
        else if (current_level.length === 2) {
            if (this.lastGuideType === GuideType.Invalid) {
                this.lastGuideType = GuideType.Force_Level_1_Left_Steps;
            }
        }

        return this.lastGuideType < guideType;
    }

    // 第一关强制引导选择锤子
    public level_1_ForceGuideSelectHammer(hammerNode: Node, guideParent: Node, doNext: Function): void {
        if (hammerNode) {
            let width = hammerNode.getComponent(UITransform).width;
            let height = hammerNode.getComponent(UITransform).height;
            let guidInfo: IGuide = {
                parent: guideParent,
                targetNode: hammerNode,
                targetPosOffset: new Vec2(30, -50),
                forceGuideArea: { posOffset: null, width, height },
                tips: "可以点击任意一个糖果进行消除哦",
                type: GuideType.Force_Level_1_Select_Hammer,
                canClickMask: false,
                fingerAniOffset: new Vec2(0, 50),
                tipsOffset: new Vec2(0, 200),
                doNext: doNext?.bind(this),
            }
            this._createGuide(guidInfo);
        }
    }

    // 第一关强制引导选择道具
    public level_1_ForceGuideSelectTool(toolNode: Node, guideParent: Node, itemType: ItemType, doNext: Function): void {
        let tips = '';
        let guideType = GuideType.Invalid;
        switch (itemType) {
            case ItemType.Hammer:
                tips = '可以点击任意一个糖果进行消除哦';
                guideType = GuideType.Force_Level_1_Select_Hammer;
                break;
            case ItemType.Boom:
                tips = '使用炸弹可以大范围消除哦';
                guideType = GuideType.Force_Level_1_Select_Boom;
                break;
        }
        if (toolNode) {
            let width = toolNode.getComponent(UITransform).width;
            let height = toolNode.getComponent(UITransform).height;
            let guidInfo: IGuide = {
                parent: guideParent,
                targetNode: toolNode,
                targetPosOffset: new Vec2(30, -50),
                forceGuideArea: { posOffset: null, width, height },
                tips: tips,
                type: guideType,
                canClickMask: false,
                fingerAniOffset: new Vec2(0, 50),
                tipsOffset: new Vec2(0, 200),
                doNext: doNext?.bind(this),
            }
            this._createGuide(guidInfo);
        }
    }

    // 第一关强制引导看提示
    public level_1_ForceGuideOnlyTips(targetNode: Node, guideParent: Node, type: GuideType, doNext: Function): void {
        let tips = '';
        let targetPosOffset: Vec2 = null;
        let fingerAniOffset: Vec2 = null;
        let tipsOffset: Vec2 = null;

        switch (type) {
            case GuideType.Force_Level_1_Pass_Target:
                tips = '达到过关目标可以完成通关';
                targetPosOffset = new Vec2(70, -200);
                fingerAniOffset = new Vec2(0, 50);
                tipsOffset = new Vec2(-200, 70);
                break;
            case GuideType.Force_Level_1_Left_Steps:
                tips = '当前关卡还可以的步数';
                targetPosOffset = new Vec2(70, -200);
                fingerAniOffset = new Vec2(0, 50);
                tipsOffset = new Vec2(-150, 70);
                break;
        }
        let width = targetNode.getComponent(UITransform).width;
        let height = targetNode.getComponent(UITransform).height;
        let guidInfo: IGuide = {
            parent: guideParent,
            targetNode: targetNode,
            targetPosOffset: targetPosOffset,
            forceGuideArea: { posOffset: null, width, height },
            tips: tips,
            type: type,
            canClickMask: true,
            fingerAniOffset: fingerAniOffset,
            tipsOffset: tipsOffset,
            doNext: doNext?.bind(this),
        }
        this._createGuide(guidInfo);
    }

    // 强制合成
    public forceGuide_Eliminate(guide_cells: number[][], allCells: Cell[][], guideParent: Node, type: GuideType, doNext: Function): void {
        let tips: string = '';
        let forceGuideAreaPosOffset: Vec2 = null;
        let fingerAniOffset: Vec2 = null;
        let widthOffset: number = 0;
        let heightOffset: number = 0;
        let targetPosOffset: Vec2 = null;
        let isRow = false;
        switch (type) {
            case GuideType.Force_Level_1_Eliminate:
                tips = '3个以上相连完成消除得分';
                forceGuideAreaPosOffset = new Vec2(-110, 0);
                fingerAniOffset = new Vec2(-50, 0);
                targetPosOffset = new Vec2(0, -20);
                widthOffset = 30;
                isRow = true;
                break;
            case GuideType.Force_Level_2_Eliminate:
                tips = '4个以上消除可以竖向消除';
                forceGuideAreaPosOffset = new Vec2(0, -40);
                fingerAniOffset = new Vec2(0, -50);
                targetPosOffset = new Vec2(20, -30);
                heightOffset = 20;
                isRow = false;
                break;
            case GuideType.Force_Level_3_Eliminate:
                tips = '5个相同色块T、L形状消除后生成炸弹';
                forceGuideAreaPosOffset = new Vec2(0, -40);
                fingerAniOffset = new Vec2(0, -50);
                targetPosOffset = new Vec2(20, -30);
                heightOffset = 20;
                isRow = false;
                break;
        }
        if (guide_cells) {
            let cells: Cell[] = [];
            for (let cellIndex of guide_cells) {
                let i = cellIndex[0];
                let j = cellIndex[1];
                let cell = allCells[i][j];
                cells.push(cell);
            }
            if (cells.length > 0) {
                if (type === GuideType.Force_Level_2_Eliminate) {
                    cells[0].node['guidecantclick'] = true;
                }
                let width = 0;
                let height = 0;
                for (let cell of cells) {
                    if (isRow) {
                        width += cell.node.getComponent(UITransform).width;
                        height = cell.node.getComponent(UITransform).height;
                    }
                    else {
                        width = cell.node.getComponent(UITransform).width;
                        height += cell.node.getComponent(UITransform).height;
                    }
                }
                width += widthOffset;
                height += heightOffset;
                let cellNode = cells[cells.length - 1].node;
                let guidInfo: IGuide = {
                    parent: guideParent,
                    targetNode: cellNode,
                    targetPosOffset: targetPosOffset,
                    forceGuideArea: { posOffset: forceGuideAreaPosOffset, width, height },
                    tips: tips,
                    type: type,
                    canClickMask: false,
                    fingerAniOffset: fingerAniOffset,
                    tipsOffset: null,
                    doNext: doNext?.bind(this),
                }
                this._createGuide(guidInfo);
            }
        }
    }

    public forceGuideUseTool(cellNode: Node, guideParent: Node, guideType: GuideType, doNext: Function): void {
        let tips = '';
        let tipsOffset: Vec2 = null;
        switch (guideType) {
            case GuideType.Force_Level_2_Use_ColMatch:
                tips = '双击或与糖果交换位置可以竖向消除';
                tipsOffset = new Vec2(0, 150);
                break;
            case GuideType.Force_Level_3_Use_Boom:
                tips = '双击或与糖果交换位置可以大范围消除';
                tipsOffset = new Vec2(0, 150);
                break;
        }
        let width = cellNode.getComponent(UITransform).width;
        let height = cellNode.getComponent(UITransform).height;
        let guidInfo: IGuide = {
            parent: guideParent,
            targetNode: cellNode,
            targetPosOffset: new Vec2(30, -70),
            forceGuideArea: { posOffset: null, width, height },
            tips: tips,
            type: guideType,
            canClickMask: false,
            fingerAniOffset: new Vec2(0, 50),
            tipsOffset: tipsOffset,
            doNext: doNext?.bind(this),
        }
        this._createGuide(guidInfo);
    }
}