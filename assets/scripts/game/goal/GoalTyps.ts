import { _decorator } from 'cc';
import { CellType } from '../Types';
import { GoalProgress } from './GoalProgress';
const { ccclass, property } = _decorator;


export interface IGoalScript {
    getGoalType(): GoalType;
    setGoal(goal: GoalProgress): void;
    getGoal(): GoalProgress;
    updateGoal(progress: GoalProgress): void;
    isComplete(): boolean;
}


export enum GoalType {
    SCORE = 0,
    TYPE_COUNTER = 1
}

export class GoalTypeCounter {
    cellType: CellType;
    counter: number;
};

/**
 * 关卡消除的目标
 */
export interface GoalValue {
    // 目标类型
    type: GoalType,
    // 目标值
    value: number | GoalTypeCounter[];
};