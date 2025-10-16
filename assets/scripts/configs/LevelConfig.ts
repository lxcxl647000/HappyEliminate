import { CellType, GridItemType } from '../game/Types';
import { GoalTypeCounter, GoalValue } from '../game/goal/GoalTyps';

export class LevelConfig {
    // 第几关,从1开始
    levelIndex: number = 1;

    steps: number = 20;
    // 关卡目标
    goal: GoalValue | number;
    types: number[] = [1, 2, 3];

    gridName: string = ''
    // 地图，默认是5*5 的正常网格
    grid: GridItemType[][] = [
        [GridItemType.NORMAL, GridItemType.NORMAL, GridItemType.NORMAL, GridItemType.NORMAL, GridItemType.NORMAL],
        [GridItemType.NORMAL, GridItemType.NORMAL, GridItemType.NORMAL, GridItemType.NORMAL, GridItemType.NORMAL],
        [GridItemType.NORMAL, GridItemType.NORMAL, GridItemType.NORMAL, GridItemType.NORMAL, GridItemType.NORMAL],
        [GridItemType.NORMAL, GridItemType.NORMAL, GridItemType.NORMAL, GridItemType.NORMAL, GridItemType.NORMAL],
        [GridItemType.NORMAL, GridItemType.NORMAL, GridItemType.NORMAL, GridItemType.NORMAL, GridItemType.NORMAL]
    ]

    cell_grid: CellType[][] = null;
    guide_cells: number[][] = null;

    // 是否完成，分数如何
    complete: boolean = false;
    starCount: number = -1;
    score: number = 0;
    // 达到三星的分数
    star3score: number = 10000;
    mapId: number = 0;
    rewards: { type: number, count: number }[] = [];
    unlock_stars: number = 0;

    constructor(level: LevelConfig) {
        this.levelIndex = level.levelIndex;
        this.steps = level.steps;
        if (typeof (level.goal) === 'number') {
            this.goal = level.goal;
        }
        else {
            this.goal = { type: level.goal.type, value: 0 };
            let g = level.goal as GoalValue;
            if (typeof (g.value) === 'number') {
                this.goal['value'] = g.value;
            }
            else {
                let arr: GoalTypeCounter[] = g.value as GoalTypeCounter[];
                this.goal['value'] = [];
                for (let i = 0; i < arr.length; i++) {
                    let element = arr[i];
                    let goalTypeCounter = new GoalTypeCounter();
                    goalTypeCounter.cellType = element.cellType;
                    goalTypeCounter.counter = element.counter;
                    this.goal['value'][i] = goalTypeCounter;
                }
            }
        }
        this.types = level.types;
        this.gridName = level.gridName;
        this.grid = level.grid;
        this.cell_grid = level.cell_grid;
        this.guide_cells = level.guide_cells;
        this.complete = level.complete;
        this.starCount = level.starCount;
        this.star3score = level.star3score;
        this.mapId = level.mapId;
        this.rewards = level.rewards;
        this.unlock_stars = level.unlock_stars || 0;
    }
}