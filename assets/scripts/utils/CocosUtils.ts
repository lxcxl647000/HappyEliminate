import { AssetManager, assetManager, ImageAsset, Node, resources, Sprite, SpriteFrame, Texture2D, UITransform, Vec3 } from "cc";

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

    /**
     * 加载远程图片
     * @param url 
     * @param sprite 
     */
    public static loadRemoteTexture(url: string, sprite: Sprite) {
        assetManager.loadRemote<ImageAsset>(url, function (err, imageAsset) {
            if (err) {
                console.log(err);
                return;
            }
            const spriteFrame = new SpriteFrame();
            const texture = new Texture2D();
            texture.image = imageAsset;
            spriteFrame.texture = texture;
            sprite.spriteFrame = spriteFrame;
        });
    }

    /**
     * 从自定义bundle里动态加载图片
     * @param bundleName 
     * @param url 
     * @param sprite 
     */
    public static loadTextureFromBundle(bundleName: string, url: string, sprite: Sprite) {
        let loadBundleTexture = (bundle: AssetManager.Bundle) => {
            bundle.load(url, ImageAsset, null, (error: Error, imageAsset: ImageAsset) => {
                if (error) {
                    console.log(error);
                    return;
                }
                const spriteFrame = new SpriteFrame();
                const texture = new Texture2D();
                texture.image = imageAsset;
                spriteFrame.texture = texture;
                sprite.spriteFrame = spriteFrame;
                if (sprite) {
                    sprite.spriteFrame = spriteFrame;
                }
            });
        };
        let bundle: AssetManager.Bundle = assetManager.getBundle(bundleName);
        if (bundle == null) {
            assetManager.loadBundle(bundleName, (error: Error, bundle: AssetManager.Bundle) => {
                loadBundleTexture(bundle);
            });
        } else {
            loadBundleTexture(bundle);
        }
    }
}