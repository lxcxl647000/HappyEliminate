import { BlockGridType, BlockType } from '../game/GameConstant';
import { TargetForTypeCount, ITargetVal } from '../game/target/TargetTyps';

export class LevelConfig {
    lvID: number = 1;
    totalSteps: number = 20;
    target: ITargetVal | number;
    blockTypes: number[] = [1, 2, 3];
    gameGrid: BlockGridType[][] = []
    blockGrid: BlockType[][] = null;
    guideBlocks: number[][] = null;
    starCount: number = -1;
    score: number = 0;
    fullStar: number = 10000;
    mapId: number = 0;
    rewards: { type: number, count: number }[] = [];
    unlock_stars: number = 0;

    constructor(level: LevelConfig) {
        this.lvID = level.lvID;
        this.totalSteps = level.totalSteps;
        if (typeof (level.target) === 'number') {
            this.target = level.target;
        }
        else {
            this.target = { type: level.target.type, value: 0 };
            let g = level.target as ITargetVal;
            if (typeof (g.value) === 'number') {
                this.target['value'] = g.value;
            }
            else {
                let arr: TargetForTypeCount[] = g.value as TargetForTypeCount[];
                this.target['value'] = [];
                for (let i = 0; i < arr.length; i++) {
                    let element = arr[i];
                    let goalTypeCounter = new TargetForTypeCount();
                    goalTypeCounter.blockType = element.blockType;
                    goalTypeCounter.count = element.count;
                    this.target['value'][i] = goalTypeCounter;
                }
            }
        }
        this.blockTypes = level.blockTypes;
        this.gameGrid = level.gameGrid;
        this.blockGrid = level.blockGrid;
        this.guideBlocks = level.guideBlocks;
        this.starCount = level.starCount;
        this.fullStar = level.fullStar;
        this.mapId = level.mapId;
        this.rewards = level.rewards;
        this.unlock_stars = level.unlock_stars || 0;
    }
}