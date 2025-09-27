import { Node, UITransform, Vec3 } from "cc";

export default class CocosUtils {
    /**
     * 通过目标节点的世界坐标转换成需要设置的节点的ui坐标
     * @param node 
     * @param target 
     * @returns 
     */
    public static setNodeToTargetPos(node: Node, target: Node): Vec3 {
        let pos = new Vec3(0, 0, 0);
        if (!node || !target || !node.parent) {
            return pos;
        }
        let targetUITransform = target.getComponent(UITransform);
        if (!targetUITransform) {
            return pos;
        }
        let nodeParentUITransform = node.parent.getComponent(UITransform);
        if (!nodeParentUITransform) {
            return pos;
        }
        let targetWorldPos = targetUITransform.convertToWorldSpaceAR(new Vec3(0, 0, 0));
        pos = nodeParentUITransform.convertToNodeSpaceAR(targetWorldPos);
        return pos;
    }
}