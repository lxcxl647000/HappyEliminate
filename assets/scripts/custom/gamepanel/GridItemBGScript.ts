import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { GridItemType } from '../../game/Types';
const { ccclass, property } = _decorator;

@ccclass('GridItemBGScript')
export class GridItemBGScript extends Component {
    @property(SpriteFrame)
    normalSF: SpriteFrame;

    @property(SpriteFrame)
    wallSF: SpriteFrame;

    @property(SpriteFrame)
    arrowLeftSF: SpriteFrame;

    private type: GridItemType = GridItemType.NORMAL;

    private needUpdate: boolean = false;

    start() {

    }

    update(deltaTime: number) {
        if (this.needUpdate) {
            this.updateBgSpriteFrame();
            this.needUpdate = false;
        }
    }

    setType(type: GridItemType) {
        if (this.type !== type) {
            this.type = type;
            this.needUpdate = true;
        }
    }

    private updateBgSpriteFrame() {
        if (this.type === GridItemType.INVALID) {
            this.node.getComponent(Sprite).spriteFrame = null;
        } else if (this.type === GridItemType.NORMAL) {
            this.node.getComponent(Sprite).spriteFrame = this.normalSF;
        } else if (this.type === GridItemType.WALL) {
            this.node.getComponent(Sprite).spriteFrame = this.wallSF;
        } else {
            // TODO: arrow 可以增加旋转的功能
            this.node.getComponent(Sprite).spriteFrame = this.arrowLeftSF;
        }
    }
}


