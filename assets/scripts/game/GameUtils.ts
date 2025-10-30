import { instantiate, Node, Prefab, Vec2 } from "cc";
import { GameGrid } from "./GameGrid";
import { TargetTyps, TargetForTypeCount, ITargetVal, ITarget } from "./target/TargetTyps";
import { TargetProgressInfo } from "./target/TargetProgressInfo";
import { TargetScore } from "./target/TargetScore";
import { TargetTypeCount } from "./target/TargetTypeCount";
import { Block } from "./Block";
import { BlockComponent } from "../custom/gamepanel/BlockComponent";

export class GameUtils {
    public static addTarget(target: ITargetVal | number, prefabs: Prefab[], targetParent: Node, isReplay: boolean): ITarget {
        if (target instanceof Number) {
            let progressInfo = new TargetProgressInfo();
            progressInfo.score = (target as Number).valueOf();
            let prefab = prefabs[TargetTyps.Type_Score];
            let node: Node = null;
            if (!isReplay) {
                node = instantiate(prefab);
                targetParent.addChild(node);
            }
            else {
                if (targetParent.children.length > 0) {
                    node = targetParent.children[0];
                }
                else {
                    node = instantiate(prefab);
                }
            }
            let score = node.getComponent(TargetScore);
            score.setTarget(progressInfo);

            return score;
        } else {
            let targetVal = target as ITargetVal;
            if (targetVal.type === TargetTyps.Type_Score) {
                let progressInfo = new TargetProgressInfo();
                progressInfo.score = (targetVal.value as Number).valueOf();

                let prefab = prefabs[TargetTyps.Type_Score];
                let node: Node = null;
                if (!isReplay) {
                    node = instantiate(prefab);
                    targetParent.addChild(node);
                }
                else {
                    if (targetParent.children.length > 0) {
                        node = targetParent.children[0];
                    }
                    else {
                        node = instantiate(prefab);
                    }
                }
                let score = node.getComponent(TargetScore);
                score.setTarget(progressInfo);

                return score;
            }
            else if (targetVal.type === TargetTyps.type_count) {
                let progressInfo = new TargetProgressInfo();
                progressInfo.types = targetVal.value as TargetForTypeCount[];
                let prefab1 = prefabs[TargetTyps.type_count];
                let node1: Node = null;
                if (!isReplay) {
                    node1 = instantiate(prefab1);
                    targetParent.addChild(node1);
                }
                else {
                    if (targetParent.children.length > 0) {
                        node1 = targetParent.children[0];
                    }
                    else {
                        node1 = instantiate(prefab1);
                    }
                }
                let target = node1.getComponent(TargetTypeCount);
                target.setTarget(progressInfo);

                return target;
            }
        }

        let targetDef = new TargetProgressInfo();
        targetDef.score = 1000;
        let prefabDefault = prefabs[TargetTyps.Type_Score];
        let nodeDefault: Node = null;
        if (!isReplay) {
            nodeDefault = instantiate(prefabDefault);
            targetParent.addChild(nodeDefault);
        }
        else {
            if (targetParent.children.length > 0) {
                nodeDefault = targetParent.children[0];
            }
            else {
                nodeDefault = instantiate(nodeDefault);
            }
        }
        let targetScoreDef = nodeDefault.getComponent(TargetScore);
        targetScoreDef.setTarget(targetDef);

        return targetScoreDef;
    }

    /**
     * 更新block的位置
     */
    public static updateBlockPos(block: Block, grid: GameGrid, onComplete?: Function) {
        let blockScript = block.blockNode.getComponent(BlockComponent);
        let temp = new Vec2(0);
        grid.setGridIDToPos(block.blockGridID, temp);
        if (block.x !== temp.x || block.y !== temp.y) {
            block.x = temp.x;
            block.y = temp.y;
            blockScript.setPosition(block.x, block.y, true, onComplete);
        } else {
            if (onComplete) {
                onComplete();
            }
        }
    }
}