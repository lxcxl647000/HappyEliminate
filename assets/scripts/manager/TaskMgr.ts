import { baseConfig } from "../configs/baseConfig";
import { httpMgr } from "../framework/lib/net/httpMgr";

interface TaskData {
    category: Category;
    tag: Tag;
    task: Task[];
}

export interface Task {
    id: string;
    title: string;
    subtitle: string;
    button_text: string;
    list_order: string;
    image: string;
    task_type: string;
    is_single: string;
    jump_url: string;
    jump_appid: string;
    jump_pages: string;
    extra_data: string;
    integral: string;
    money: string;
    reward_type: string;
    is_dev: string;
    is_minute_repeat: string;
    browse_time: string;
    owner_id: string;
    status: string;
    life_task_id: string;
    is_virtual: string;
    life_order: string;
    last_click_time: string;
    today_click_amount: string;
    today_limit_click_amount: string;
    total_click_amount: string;
    total_limit_click_amount: string;
    scene_id: string;
    ad_id: string;
    group_id: string;
    xcx_name: string;
    xcx_logo: string;
    is_block: string;
    finish_num: string;
    is_recommend: string;
    flow_id: string;
    corner: string;
    template: string;
    temp_type: string;
    transfer_config: string;
    transfer_title: string;
    tag: string;
    category_id: string;
    isComplete: number;
    finish_complete_num: number;
    friends_status: number;
}

interface Tag {
    special: string[];
    allList: string[];
    index: string[];
    clean: any[];
    sign: any[];
}

interface Category {
    index: string;
    special: string;
}


interface TaskCompleteData {
    task: number;
    isDouble: boolean;
    card_type: number;
    prop: null;
    award_type: string;
    award: number;
}

export class renwuMgr {
    private static _ins: renwuMgr = null;

    private _taskList: Task[] = [];
    public get taskList(): Task[] {
        return this._taskList;
    }

    public jumpTask: Task = null;
    public recordTime: Date = null

    public static get ins() {
        if (this._ins == null) {
            this._ins = new renwuMgr();
        }
        return this._ins;
    }

    public async getTaskList(cb: Function) {
        let res = await httpMgr.ins.xhrRequest<TaskData>('/task/getList');
        if (res) {
            const list =  res.data.task.filter((item: Task) => item.id !== res.data.tag.sign[0]);
            this._taskList = list.filter((item: Task) => item.isComplete !== 1);
            cb && cb();
        }
    }

    public async clickTask(taskId: number, cb: Function) {
        let res = await httpMgr.ins.xhrRequest('/Task/taskClickLog', 'GET', { taskId, channelId: baseConfig.adzoneId });
        if (res) {
            cb && cb();
        }
    }

    public async completeTask(task, cb: Function) {
        let res = await httpMgr.ins.xhrRequest<TaskCompleteData>('/task/complete', 'GET', { taskId: task.id, channelId: baseConfig.adzoneId });
        if (res && res.data) {
            cb && cb(res.data);
        }
    }

    // 阶段性奖励
    public async getTaskRewardStages(cb: Function) {
        let res=  await httpMgr.ins.xhrRequest('/game/getTaskRewardStages', 'GET');
        if (res && res.data) {
            cb && cb(res.data);
        }
    }

    // 领取阶段性奖励
    public async claimStageReward(stage: string, cb: Function) {
        let res=  await httpMgr.ins.xhrRequest('/game/claimStageReward', 'GET', { stage: stage});
        if (res && res.data) {
            cb && cb(res.data);
        }
    }
}