import { JsonAsset, _decorator } from 'cc';
import { GridItemType } from './Types';
import { GoalValue } from './goal/GoalTyps';
const { ccclass, property } = _decorator;

export class Level {
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

    // 是否完成，分数如何
    complete: boolean = false;
    starCount: number = -1;
    score: number = 0;
    // 达到三星的分数
    star3score: number = 10000;
}

export class LevelUtil {
    public static loadFromJson(json: JsonAsset): Level[] {
        let levels = [];
        if (json) {
            levels = json.json as Level[];
        }
        return levels;
    }

    public static loadFromJsonString(str: string): Level[] {
        let levels = [];
        if (str) {
            levels = JSON.parse(str) as Level[];
        }
        return levels;
    }

    // 拷贝最后的结果，用于合并记录
    public static copyLevelResult(from: Level, to: Level) {
        to.complete = from.complete;
        to.starCount = from.starCount;
        to.score = from.score;
    }

    public static mergeLevels(levels: Level[], localStorageLevels: Level[]): Level[] {
        // 根据levelIndex进行合并
        levels.forEach(element => {
            for (let index = 0; index < localStorageLevels.length; index++) {
                const localLevel = localStorageLevels[index];
                if (element.levelIndex === localLevel.levelIndex) {
                    LevelUtil.copyLevelResult(localLevel, element);

                    break;
                }
            }
        });
        return levels;
    }
}