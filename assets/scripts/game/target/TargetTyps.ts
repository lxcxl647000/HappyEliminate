import { _decorator } from 'cc';
import { TargetProgressInfo } from './TargetProgressInfo';
import { BlockType } from '../GameConstant';
const { ccclass, property } = _decorator;


export interface ITarget {
    getType(): TargetTyps;
    isComplete(): boolean;
    setTarget(target: TargetProgressInfo): void;
    getTarget(): TargetProgressInfo;
    updateTarget(progress: TargetProgressInfo): void;
}

export interface ITargetVal {
    type: TargetTyps,
    value: number | TargetForTypeCount[];
};

export enum TargetTyps {
    Type_Score = 0,
    type_count = 1
}

export class TargetForTypeCount {
    blockType: BlockType;
    count: number;
};