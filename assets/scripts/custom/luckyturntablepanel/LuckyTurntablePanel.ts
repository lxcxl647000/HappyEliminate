import { _decorator, Component, Node, tween } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import { LuckyRewardItem } from './LuckyRewardItem';
import MathUtils from '../../utils/MathUtils';
import { GameConstant } from '../../game/GameConstant';
import TimeUtils from '../../utils/TimeUtils';
import GetItemMgr from '../../manager/GetItemMgr';
import { rewardedVideoAd } from '../../framework/lib/platform/platform_interface';
import { LuckyTurntableConfig } from '../../configs/LuckyTurntableConfig';
import ConfigMgr from '../../manager/ConfigMgr';
import { configConfigs } from '../../configs/configConfigs';
import { PlatformConfig } from '../../framework/lib/platform/configs/PlatformConfig';
const { ccclass, property } = _decorator;

interface TurntableStorageData {
    // 完成的时间戳 跨天后清0//
    time: number;
    // 已使用次数//
    count: number;
}

@ccclass('LuckyTurntablePanel')
export class LuckyTurntablePanel extends PanelComponent {
    @property(Node)
    rotateNode: Node = null;
    @property(Node)
    maskNode: Node = null;
    @property(Node)
    startBtnNode: Node = null;
    @property(Node)
    startADBtnNode: Node = null;

    /**转盘转几圈开始减速 */
    private readonly TurnCycles: number = 3;
    /**转盘每圈耗时 */
    private readonly TurnCycleTime_s: number = 0.8;
    private readonly OrignalAngle = 0;
    private readonly OffsetAngle = 20;

    private _rewardArr: LuckyTurntableConfig[] = [];
    /**奖励索引  */
    private _rewardIndex: number = 0;
    private _weightArr: number[] = [];

    private _useData: TurntableStorageData = { time: 0, count: 0 };


    show(option: PanelShowOption): void {
        option.onShowed();

        this._init();
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    private _init() {
        this._useData = qc.storage.getObj(GameConstant.LUCKY_TURNTABLE_DATA_KEY, this._useData);
        if (!TimeUtils.IsSameDay(this._useData.time, TimeUtils.now())) {
            this._useData.count = 0;
        }

        this._updateBtnStatus();

        this.rotateNode.angle = this.OrignalAngle;
        if (this._rewardArr.length === 0) {
            let configs = ConfigMgr.ins.getConfigArr<LuckyTurntableConfig>(configConfigs.luckyTurntableConfig);
            for (let config of configs) {
                this._rewardArr.push(config);
            }
            this._initReward();
        }
    }

    private _updateBtnStatus() {
        if (this._useData.count >= GameConstant.LuckyTurntable_TotalNum) {
            this.startBtnNode.active = false;
            this.startADBtnNode.active = false;
        }
        else {
            this.startBtnNode.active = this._useData.count === 0;
            this.startADBtnNode.active = this._useData.count > 0;
        }
    }

    private _initReward() {
        let index = 0;
        for (let reward of this._rewardArr) {
            let item = this.rotateNode.children[index++].getComponent(LuckyRewardItem);
            if (item) {
                item.init(reward);
            }
        }
    }

    private _closePanel() {
        qc.panelRouter.hide({ panel: PanelConfigs.luckyTurntablePanel });
    }

    onClickClose() {
        this._closePanel();
    }

    onClickStart() {
        this._onTurnTable();
    }

    onClickAdStart() {
        let ad: rewardedVideoAd = {
            adUnitId: PlatformConfig.ins.config.adUnitIds[0],
            successCb: () => {
                this._onTurnTable();
            }
        }
        qc.platform.showRewardedAd(ad);
    }

    private _getResult() {
        if (this._weightArr.length === 0) {
            for (let reward of this._rewardArr) {
                this._weightArr.push(reward.weight);
            }
        }
        this._rewardIndex = MathUtils.GetRandomIndexByWeight(this._weightArr);
        console.log('_rewardIndex', this._rewardIndex, '  reward ', this._rewardArr[this._rewardIndex]);

    }

    /**
     * 转动转盘
     */
    private _onTurnTable(): void {
        this._useData.time = TimeUtils.now();
        this._useData.count++;
        this.maskNode.active = true;
        this._getResult();
        qc.storage.setObj(GameConstant.LUCKY_TURNTABLE_DATA_KEY, this._useData);

        let angle = 360 * this.TurnCycles;
        this.rotateNode.angle = this.OrignalAngle;
        let dTime = this.TurnCycles * this.TurnCycleTime_s;
        tween(this.rotateNode)
            .to(dTime, { angle: angle }, { easing: "cubicIn" })
            .call(() => {
                this._uniformVelocity();
            }).start();
    }
    /**
     * 匀速
     */
    private _uniformVelocity(): void {
        let curCycles = 2;
        let CycleTime_ms = this.TurnCycleTime_s / 2;
        let angle = 360 * curCycles;
        this.rotateNode.angle = this.OrignalAngle;
        let dTime = curCycles * CycleTime_ms;
        tween(this.rotateNode)
            .to(dTime, { angle: angle }, { easing: "linear" })
            .call(() => {
                this._shiftDown();
            }).start();
    }

    /**
     * 减速
     */
    private _shiftDown(): void {
        this.rotateNode.angle = this.OrignalAngle;
        let angle = 360 + (360 / this._rewardArr.length) * this._rewardIndex + this.OffsetAngle;
        let dTime = this.TurnCycles * this.TurnCycleTime_s;
        tween(this.rotateNode)
            .to(dTime, { angle: angle }, { easing: "cubicOut" })
            .call(() => {
                this.rotateNode.angle = angle;
                this._onResult();
            }).start();
    }

    /**转盘抽奖结果 */
    private _onResult(): void {
        // test//
        let reward = this._rewardArr[this._rewardIndex];
        if (reward.itemtype !== -1) {
            GetItemMgr.ins.showGetItem(reward.itemtype, reward.num, true);
        }
        // test//

        this._updateBtnStatus();
        this.maskNode.active = false;
    }
}


