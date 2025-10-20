import { Asset, AssetManager, assetManager, ImageAsset, Node, resources, Sprite, SpriteFrame, Texture2D, UITransform, Vec3 } from "cc";
import AssetLoader from "../framework/lib/asset/AssetLoader";

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
     * @param path 
     * @param sprite 
     */
    public static loadTextureFromBundle(bundleName: string, path: string, sprite: Sprite, cb?: Function) {
        CocosUtils.loadFromBundle<ImageAsset>(bundleName, path, Asset).then((imageAsset: ImageAsset) => {
            if (imageAsset) {
                const spriteFrame = new SpriteFrame();
                const texture = new Texture2D();
                texture.image = imageAsset;
                spriteFrame.texture = texture;
                sprite.spriteFrame = spriteFrame;
                if (sprite) {
                    sprite.spriteFrame = spriteFrame;
                }
                cb && cb();
            }
        })
    }

    public static loadFromBundle<T extends Asset>(bundleName: string, path: string, type: typeof Asset): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            let loadBundle = (bundle: AssetManager.Bundle) => {
                bundle.load(path, type, (error: Error, resLoad: T) => {
                    error ? resolve(null) : resolve(resLoad);
                });
            };
            let bundle: AssetManager.Bundle = assetManager.getBundle(bundleName);
            if (bundle == null) {
                AssetLoader.loadBundle(bundleName).then((bundle: AssetManager.Bundle) => {
                    loadBundle(bundle);
                })
            } else {
                loadBundle(bundle);
            }
        });
    }
}