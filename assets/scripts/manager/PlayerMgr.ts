import EventDef from "../constants/EventDef";
import { ItemType } from "../configs/ItemConfig";
import { qc } from "../framework/qc";
import { baseConfig } from '../configs/baseConfig';
import HomeApi from "../api/index";
import LevelMgr from "./LevelMgr";
interface Prompt {
    can_open: any;
    show: number;
    type: number;
    next_threshold: number;
    remain: number;
    open_level: number;
}

interface Props {
    user_id: number;
    money: number;
    integral: number;
    total_money: number;
    total_integral: number;
    total_withdraw_money: number;
    strength: number;
    hammer_num: number;
    bomb_num: number;
    board_num: number;
    step_number: number;
    theme_num: number;
}

interface Summary {
    latest_passed_level: number;
    passed_levels: number;
    total_stars: number;
    total_score: number;
    map_on: number;
    current_theme_id: string
}
interface userInfoFace {
    current_level: Currentlevel[];
    summary: Summary;
    props: Props;
    prompt: Prompt;
    is_new_today: number;
    strength_recover: any;
    prop_video_remain: number;
}

export interface Currentlevel {
    level_no: number;
    best_score: number;
    best_stars: number;
    play_times: number;
    pass_status: string;
    create_time: null | string;
    update_time: null | string;
}
export default class PlayerMgr {
    private static _instance: PlayerMgr = null;
    public static get ins(): PlayerMgr {
        if (this._instance == null) {
            this._instance = new PlayerMgr();
        }
        return this._instance;
    }

    public userInfo: userInfoFace = null
    time: any = null
    timeNum: any = 18000000
    timeOne: any = true
    runTime: any = 0
    // 金币
    public addGold(num: number) {
        this.userInfo.props.integral += num;
        if (this.userInfo.props.integral < 0) {
            this.userInfo.props.integral = 0;
        }
        qc.eventManager.emit(EventDef.Update_Gold);
    }

    // 体力
    public addEnergy(num: number) {
        this.userInfo.props.strength += num;
        this.getEnergy()
        if (this.userInfo.props.strength < 0) {
            this.userInfo.props.strength = 0;
        }
        qc.eventManager.emit(EventDef.Update_Energy);

    }

    // 红包
    public addCash(num: number) {
        this.userInfo.props.money += num;
        if (this.userInfo.props.money < 0) {
            this.userInfo.props.money = 0;
        }
        qc.eventManager.emit(EventDef.Update_Cash);
    }

    // 获得对应道具数量
    public getItemNum(itemId: ItemType) {
        let num = 0;
        switch (itemId) {
            case ItemType.Gold:
                num = this.userInfo.props.integral;
                break;
            case ItemType.Energy:
                num = this.userInfo.props.strength;
                break;
            case ItemType.Hammer:
                num = this.userInfo.props.hammer_num;
                break;
            case ItemType.Boom:
                num = this.userInfo.props.bomb_num;
                break;
            case ItemType.Theme_Clips:
                num = this.userInfo.props.theme_num;
                break;
            case ItemType.Steps:
                num = this.userInfo.props.step_number;
                break;
            case ItemType.Sort:
                num = this.userInfo.props.board_num;
                break;
            case ItemType.Avatar:
                num = 0;
                break;
        }
        return num;
    }

    //增加或减少道具数量
    public addItem(itemType: ItemType, num: number) {
        if (itemType < 0) {
            return;
        }

        switch (itemType) {
            case ItemType.Gold:
                this.addGold(num);
                break;
            case ItemType.Energy:
                this.addEnergy(num);
                break;
            case ItemType.Hammer:
                this.userInfo.props.hammer_num += num;
                if (this.userInfo.props.hammer_num < 0) {
                    this.userInfo.props.hammer_num = 0;
                }
                break;
            case ItemType.Boom:
                this.userInfo.props.bomb_num += num;
                if (this.userInfo.props.bomb_num < 0) {
                    this.userInfo.props.bomb_num = 0;
                }
                break;
            case ItemType.Theme_Clips:
                this.userInfo.props.theme_num += num;
                if (this.userInfo.props.theme_num < 0) {
                    this.userInfo.props.theme_num = 0;
                }
                break;
            case ItemType.Steps:
                this.userInfo.props.step_number += num;
                if (this.userInfo.props.step_number < 0) {
                    this.userInfo.props.step_number = 0;
                }
                break;
            case ItemType.Sort:
                this.userInfo.props.board_num += num;
                if (this.userInfo.props.board_num < 0) {
                    this.userInfo.props.board_num = 0;
                }
                break;
            case ItemType.Avatar:

                break;
        }
        qc.eventManager.emit(EventDef.Update_Item, itemType);
    }

    public getLevelsInfo(level: number) {
        for (let levelInfo of this.userInfo.current_level) {
            if (levelInfo.level_no === level) {
                return levelInfo;
            }
        }
        return null;
    }

    // 接口请求首页数据
    public async getHomeData(cb?: Function) {
        console.log('调用了首页数据');
        let res = await HomeApi.ins.getHomeData({ userId: baseConfig.userId })
        if (!res.data.props) {
            res.data.props = {};
            res.data.props.user_id = baseConfig.userId;
            res.data.props.money = 0;
            res.data.props.integral = 0;
            res.data.props.total_money = 0;
            res.data.props.total_integral = 0;
            res.data.props.total_withdraw_money = 0;
            res.data.props.strength = 0;
            res.data.props.hammer_num = 0;
            res.data.props.bomb_num = 0;
            res.data.props.board_num = 0;
            res.data.props.step_number = 0;
            res.data.props.theme_num = 0;
        }
        this.userInfo = res.data

        this.userInfo.prop_video_remain = +res.data.prop_video_remain;
        this.userInfo.props.user_id = +res.data.props.user_id;
        this.userInfo.props.money = +res.data.props.money;
        this.userInfo.props.integral = +res.data.props.integral;
        this.userInfo.props.total_money = +res.data.props.total_money;
        this.userInfo.props.total_integral = +res.data.props.total_integral;
        this.userInfo.props.total_withdraw_money = +res.data.props.total_withdraw_money;
        this.userInfo.props.strength = +res.data.props.strength;
        qc.eventManager.emit(EventDef.Update_Energy);
        this.userInfo.props.hammer_num = +res.data.props.hammer_num;

        this.userInfo.props.bomb_num = +res.data.props.bomb_num;
        this.userInfo.props.board_num = +res.data.props.board_num;
        this.userInfo.props.step_number = +res.data.props.step_number;
        this.userInfo.props.theme_num = +res.data.props.theme_num;
        qc.eventManager.emit(EventDef.Update_Gold);
        if (res.data.summary.map_on === 0) {
            PlayerMgr.ins.userInfo.summary.map_on = 1;
        }
        if (res.data.summary.current_theme_id === undefined || res.data.summary.current_theme_id === '0') {
            PlayerMgr.ins.userInfo.summary.current_theme_id = '1';
        }
        qc.eventManager.emit(EventDef.Update_Left_Level_Redpack);
        console.log('this.userInfo', this.userInfo);
        cb && cb();
    }

    public async getStrengthData() {
        let res = await HomeApi.ins.getHomeData({ userId: baseConfig.userId });
        this.userInfo.props.strength = +res.data.props.strength;
        qc.eventManager.emit(EventDef.Update_Energy);
    }

    // 首页体力恢复方法
    public getEnergy() {
        console.log('进入了', this.userInfo);
        console.log('定时器', this.time);

        if (this.userInfo.strength_recover.recovering == 1) {
            // if (this.timeOne) {
            //     console.log(1111);


            //     // this.timeNum = 14000
            // } else {
            //     this.timeNum = 5.9 * 60 * 1000
            //     this.runTime = this.timeNum
            //     // this.timeNum = 18000
            // }
            this.timeNum = this.userInfo.strength_recover.remain_seconds * 1000
            this.runTime = this.timeNum
            if (this.userInfo.props.strength >= 100) {
                if (this.time) {
                    clearInterval(this.time)
                    qc.eventManager.emit(EventDef.Close_Strength_Timer)
                    this.time = null
                }

            } else {
                if (!this.time) {
                    this.time = setInterval(async () => {
                        this.runTime = this.runTime - 1000
                        if (this.runTime <= 0) {
                            // this.addEnergy(1)
                            await this.getStrengthData()
                            this.addEnergy(0)
                            qc.eventManager.emit(EventDef.Update_RewardCount)
                            this.runTime = this.timeNum
                        }
                        this.timeOne = false
                        qc.eventManager.emit(EventDef.Close_Strength_Timer, this.runTime)
                    }, 1000);
                }
            }
        }
    }
    public clearTime() {
        if (this.time) {
            clearInterval(this.time);
            this.time = null;
        }
    }

    // 更新主题
    public updateTheme(theme_id: string) {
        this.userInfo.summary.current_theme_id = theme_id;
        qc.eventManager.emit(EventDef.Update_Theme, theme_id);
    }

    // 更具地图id获得该地图的星星数
    public getMapStars(mapId: number) {
        let stars = 0;
        let levels = PlayerMgr.ins.userInfo.current_level;
        let map = LevelMgr.ins.getMap(mapId);
        if (map) {
            for (let level of map.values()) {
                for (let levelData of levels) {
                    if (levelData.level_no === level.levelIndex) {
                        stars += levelData.best_stars;
                    }
                }
            }
        }
        return stars;
    }

    public getPassLevels(mapId: number) {
        let levels = PlayerMgr.ins.userInfo.current_level;
        let map = LevelMgr.ins.getMap(mapId);
        let passCount = 0;
        if (map) {
            for (let level of map.values()) {
                for (let levelData of levels) {
                    if (levelData.level_no === level.levelIndex) {
                        passCount++;
                    }
                }
            }
        }
        return passCount;
    }

    public setLevelInfo(info: Currentlevel) {
        let levelInfo = this.getLevelsInfo(info.level_no);
        if (levelInfo) {
            levelInfo = info;
        }
        else {
            this.userInfo.current_level.push(info);
        }
    }
}
