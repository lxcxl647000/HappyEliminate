import { _decorator, Animation, instantiate, Label, Node, Sprite, UITransform } from 'cc';
import { StarUtils } from './StarUtils';
import { DiaLogBaseScript, IDialogOption } from './DiaLogBaseScript';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import EventDef from '../../constants/EventDef';
import { LevelConfig } from '../../configs/LevelConfig';
import { GoalTypeCounter, GoalValue } from '../../game/goal/GoalTyps';
import CustomSprite from '../componetUtils/CustomSprite';
import { ItemConfig } from '../../configs/ItemConfig';
import ConfigMgr from '../../manager/ConfigMgr';
import { configConfigs } from '../../configs/configConfigs';
import CocosUtils from '../../utils/CocosUtils';
import { BundleConfigs } from '../../configs/BundleConfigs';
import PlayerMgr from '../../manager/PlayerMgr';
import LevelMgr, { PassReward } from '../../manager/LevelMgr';
import { musicMgr } from '../../manager/musicMgr';
import { rewardedVideoAd } from '../../framework/lib/platform/platform_interface';
import CommonTipsMgr from '../../manager/CommonTipsMgr';
import { Constants } from '../../game/Constants';
const { ccclass, property } = _decorator;

@ccclass('DiaLogScript')
export class DiaLogScript extends DiaLogBaseScript {

    @property(Node)
    star1Node: Node;

    @property(Node)
    star2Node: Node;

    @property(Node)
    star3Node: Node;

    @property(Node)
    scoreLabelNode: Node;

    @property(Node)
    successNode: Node;
    @property(Node)
    successStarNode: Node;
    @property(Node)
    successStarEmptyNode: Node;

    @property(Node)
    lightNode: Node;
    @property(Node)
    lightNode2: Node;

    @property(Node)
    failedNode: Node;
    @property(Node)
    failedStarNode: Node;

    @property(Node)
    targetParent: Node = null;

    @property(UITransform)
    rewardBg: UITransform = null;
    @property(Node)
    rewardTmp: Node = null;
    @property(Node)
    normalLayout: Node = null;
    @property(Node)
    doubleLayout: Node = null;
    @property(Node)
    doubleNode: Node = null;
    @property(Node)
    continueBtnNode: Node = null;
    @property(UITransform)
    bg: UITransform = null;
    @property(Node)
    adBtnNode: Node = null;
    @property(Node)
    goldBtnNode: Node = null;
    @property(Node)
    exitBtnNode: Node = null;
    @property(Node)
    replayBtnNode: Node = null;
    @property(Node)
    resurrectionTipsNode: Node = null;
    @property(Node)
    finalFailedNode: Node = null;


    // 成功还是失败
    private success: boolean = false;
    private _normalHeight: number = 240;
    private _doubleHeight: number = 342;
    private _normalBgHeight: number = 567;
    private _doubleBgHeight: number = 670;
    private _continueBtnNormalPosY: number = -317;
    private _continueBtnDoublePosY: number = -419;
    private _rewards: PassReward[] = [];
    private _isDouble: boolean = false;
    private _leftResurrectionCount: number = 1;

    update(deltaTime: number) {

    }

    start(): void {

    }

    show(opt?: IDialogOption): void {
        this.dialogOpt = opt;
        let ani = this.getComponent(Animation);
        if (ani) {
            let aniName = this.success ? 'pass_success' : 'pass_fail';
            ani.play(aniName);
        }
    }

    setStarCounter(counter: number) {
        if (counter === 0) {
            counter = 1;
        }
        StarUtils.changeNodeByCounter(counter, this.star1Node, this.star2Node, this.star3Node);
    }

    setScore(score: number) {
        this.scoreLabelNode.getComponent(Label).string = JSON.stringify(score);
    }

    setSuccess(success: boolean, level: LevelConfig) {
        this.success = success;
        this.successStarEmptyNode.active = this.successStarNode.active = this.lightNode2.active = this.lightNode.active = this.successNode.active = this.success;
        this.failedStarNode.active = this.failedNode.active = !this.success;
        if (!this.success) {
            this._setTarget(level);
            if (this._leftResurrectionCount > 0) {
                this._leftResurrectionCount--;
                this.resurrectionTipsNode.active = this.adBtnNode.active = this.goldBtnNode.active = true;
                this.finalFailedNode.active = this.exitBtnNode.active = this.replayBtnNode.active = false;
            }
            else {
                this.resurrectionTipsNode.active = this.adBtnNode.active = this.goldBtnNode.active = false;
                this.finalFailedNode.active = this.exitBtnNode.active = this.replayBtnNode.active = true;
            }
        }
        else {
            musicMgr.ins.playMusic('victory');
        }
    }

    public setRewards(rewards: PassReward[], isDouble: boolean = false) {
        this._rewards = rewards;
        this._isDouble = isDouble;
        if (isDouble) {
            this.rewardBg.height = this._doubleHeight;
            this.bg.height = this._doubleBgHeight;
            this.continueBtnNode.setPosition(this.continueBtnNode.position.x, this._continueBtnDoublePosY);
        }
        else {
            this.rewardBg.height = this._normalHeight;
            this.bg.height = this._normalBgHeight;
            this.continueBtnNode.setPosition(this.continueBtnNode.position.x, this._continueBtnNormalPosY);
        }
        this._initReward(rewards, this.normalLayout);
        this.doubleNode.active = isDouble;
        if (isDouble) {
            this._initReward(rewards, this.doubleLayout);
        }
    }

    private _initReward(rewards: PassReward[], parent: Node) {
        for (let reward of rewards) {
            let node = instantiate(this.rewardTmp);
            node.active = true;
            node.parent = parent;
            let item = ConfigMgr.ins.getConfig<ItemConfig>(configConfigs.itemConfig, reward.type);
            if (item) {
                CocosUtils.loadTextureFromBundle(BundleConfigs.iconBundle, item.icon, node.getComponent(Sprite));
            }
            node.getComponentInChildren(Label).string = "+" + reward.amount;
        }
    }

    onContinueClick() {
        if (this.dialogOpt && this.dialogOpt.onConform) {
            this.dialogOpt.onConform();
        }
        if (this.success) {
            this._getRewards();
        }
    }

    onCloseClick() {
        qc.panelRouter.hide({
            panel: PanelConfigs.gamePanel,
            onHided: () => {
                qc.eventManager.emit(EventDef.GamePanelToMainPanel);

                qc.panelRouter.destroy({
                    panel: PanelConfigs.gamePanel,
                });
            },
        });
        musicMgr.ins.playMusic('bg_music');
        if (this.success) {
            this._getRewards();
        }
    }

    addStepsByAd() {
        let ad: rewardedVideoAd = {
            adUnitId: qc.platform.getAllAdUnitIds()[0],
            successCb: () => {
                this.node.active = false;
                qc.eventManager.emit(EventDef.Resurrection);
            }
        }
        qc.platform.showRewardedAd(ad);
    }

    addStepsByGold() {
        if (PlayerMgr.ins.userInfo.props.integral < Constants.Steps_Cost_Gold) {
            CommonTipsMgr.ins.showTips('金币不足');
            return;
        }
        LevelMgr.ins.useGoldGetSteps((data) => {
            PlayerMgr.ins.addGold(-data.cost);
            this.node.active = false;
            qc.eventManager.emit(EventDef.Resurrection);
        });
    }

    private _setTarget(level: LevelConfig) {
        if (level) {
            let goal = level.goal as GoalValue;
            if (goal) {
                let goals = goal.value as GoalTypeCounter[];
                for (let i = 0; i < this.targetParent.children.length; i++) {
                    let target = this.targetParent.children[i];
                    target.active = i < goals.length;
                    if (target.active) {
                        let icon = target.getComponent(CustomSprite);
                        icon.index = goals[i].cellType;
                        icon.getComponentInChildren(Label).string = goals[i].counter.toString();
                    }
                }
            }
        }
    }

    private _getRewards() {
        for (let reward of this._rewards) {
            let count = this._isDouble ? reward.amount * 2 : reward.amount;
            PlayerMgr.ins.addItem(reward.type, count);
        }
    }

    onReplay() {
        qc.eventManager.emit(EventDef.Replay_Btn_Event, true);
        this.node.active = false;
        this._leftResurrectionCount = 1;
    }
}
