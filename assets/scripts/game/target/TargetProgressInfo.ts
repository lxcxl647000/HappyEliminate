import { Block } from '../Block';
import { TargetForTypeCount } from './TargetTyps';


export class TargetProgressInfo {
    score: number = 0;
    types: TargetForTypeCount[] = [];

    checkReduce(blocks: Block[]): Block[] {
        let res: Block[] = [];
        if (this.types) {
            blocks.forEach(c => {
                this.types.forEach(element => {
                    if (element.blockType === c.type) {
                        element.count -= 1;
                        if (element.count < 0) {
                            element.count = 0;
                        }
                        res.push(c);
                    }
                });
            })
        }
        return res;
    }
}
