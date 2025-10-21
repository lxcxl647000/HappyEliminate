import { _decorator, Component, Sprite, Label } from 'cc';
import CocosUtils from '../utils/CocosUtils';
import { renwuMgr, Task } from '../manager/TaskMgr';
import { qc } from "../framework/qc";
import { rewardedVideoAd } from "../framework/lib/platform/platform_interface";
import CustomSprite from "../custom/componetUtils/CustomSprite";
import EventDef from '../constants/EventDef';
const { ccclass, property } = _decorator;

@ccclass('taskItems')
export class taskItems extends Component {
    @property(Label)
    title: Label = null;
    @property(Label)
    subtitle: Label = null;
    @property(Label)
    button_text: Label = null;
    @property(Label)
    money: Label = null;
    @property(Sprite)
    taskImg: Sprite = null;
    @property(Sprite)
    iconImg: Sprite = null;

    private _task: Task = null;

    public get task() {
        return this._task;
    }

    // 加载远程图片
    setRemoteImage(url: string, nodeSprite: Sprite) {
        CocosUtils.loadRemoteTexture(url, nodeSprite);
    }

    // 任务中心
    public setData(task: Task) {
        this._task = task;
        this.title.string = task.title || '';
        this.subtitle.string = task.subtitle || '';
        let gold = +task.reward_type === 1 ? task.money : task.integral;
        this.money.string = +task.reward_type === 1 ? `+${gold}元` : `+${gold}金币`;
        // @ts-ignore
        if (task.reward_type == 1) {
            this.iconImg.getComponent(CustomSprite).index = 1;
        } else {
            this.iconImg.getComponent(CustomSprite).index = 0;
        }
        this.button_text.string = task.button_text;
        this.setRemoteImage(task.image, this.taskImg);
    }

    // 去完成
    handleComplete() {
        if (!this._task) {
            return;
        }
        try {
            renwuMgr.ins.jumpTask = this._task;
            renwuMgr.ins.clickTask(+this._task.id, () => {
                renwuMgr.ins.recordTime = new Date();
                let task_type = +this._task.task_type;
                switch (task_type) {
                    case 8:// 跳转//
                        if (this._task.jump_pages) {
                            renwuMgr.ins.jumpTask = this._task;
                            location.href = this._task.jump_pages;
                        }
                        break;
                    case 12:// 激励广告//
                        if (this._task.ad_id) {
                            let ad: rewardedVideoAd = {
                                adUnitId: this._task.ad_id,
                                successCb: (e) => {
                                },
                                failCb: (e) => {
                                    qc.eventManager.emit(EventDef.TaskCompleted,e.isCompleted);
                                },
                            }
                            qc.platform.showRewardedAd(ad);
                        }
                        break;
                    default:
                        break;
                }

            });
        } catch (error) {
        }
    }
}


