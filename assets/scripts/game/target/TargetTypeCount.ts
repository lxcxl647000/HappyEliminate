import { _decorator, Component, Node } from 'cc';
import { TargetTyps, TargetForTypeCount, ITarget } from './TargetTyps';
import { TargetProgressInfo } from './TargetProgressInfo';
import { TypeCountItem } from './TypeCountItem';
const { ccclass, property } = _decorator;

@ccclass('TargetTypeCount')
export class TargetTypeCount extends Component implements ITarget {
    @property(Node)
    target_type1: Node;
    @property(Node)
    target_type2: Node;
    @property(Node)
    target_type3: Node;
    @property(Node)
    target_type4: Node;

    private progressInfo: TargetProgressInfo = null;

    onLoad() {
        this.target_type4.active = false;
        this.target_type1.active = false;
        this.target_type3.active = false;
        this.target_type2.active = false;
    }

    getType(): TargetTyps {
        return TargetTyps.type_count;
    }

    setTarget(progressInfo: TargetProgressInfo) {
        this.progressInfo = progressInfo

        if (this.progressInfo.types !== null) {
            let types = this.progressInfo.types;
            this.updateTypes(types);
        }
    }

    getTarget(): TargetProgressInfo {
        return this.progressInfo;
    }

    private updateTypes(types: TargetForTypeCount[], playAni: boolean = false) {
        if (types.length > 0) {
            this.setTypeTarget(this.target_type1, types[0], playAni);
        }
        if (types.length > 1) {
            this.setTypeTarget(this.target_type2, types[1], playAni);
        }
        if (types.length > 2) {
            this.setTypeTarget(this.target_type3, types[2], playAni);
        }
        if (types.length > 3) {
            this.setTypeTarget(this.target_type4, types[3], playAni);
        }
    }

    updateTarget(progress: TargetProgressInfo) {
        this.progressInfo = this.progressInfo;
        if (progress.types !== null) {
            let types = progress.types;
            this.updateTypes(types, true);
        }
    }

    isComplete(): boolean {
        if (this.progressInfo && this.progressInfo.types !== null) {
            for (let index = 0; index < this.progressInfo.types.length; index++) {
                const element = this.progressInfo.types[index];
                if (element.count > 0) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }


    private setTypeTarget(typeItem: Node, item: TargetForTypeCount, playAni: boolean = false) {
        let typeItemScript = typeItem.getComponent(TypeCountItem);
        typeItemScript.setType(item.blockType);
        typeItemScript.setNumber(item.count, playAni);
        if (item.count <= 0) {
            typeItemScript.setComplete(true);
        } else {
            typeItemScript.setComplete(false);
        }

        typeItem.active = true;
    }
}