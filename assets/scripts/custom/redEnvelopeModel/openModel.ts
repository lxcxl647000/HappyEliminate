import { _decorator, assetManager, AssetManager, ImageAsset, SpriteFrame, Component, instantiate, Label, log, Mask, Node, Sprite, Texture2D, UITransform, UI } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import PlayerMgr from '../../manager/PlayerMgr';
import CustomSprite from '../componetUtils/CustomSprite';
import redModelApi from '../../api/redModle';
import CommonTipsMgr from "../../manager/CommonTipsMgr";
import LevelMgr from '../../manager/LevelMgr';

const { ccclass, property } = _decorator;
@ccclass('redEnvelopePanel')
export class redEnvelopePanel extends PanelComponent {
    @property(Node)
    modelFlag: Node;
    @property(Node)
    modelTiele: Node;
    @property(Node)
    modelContentOpen: Node;
    @property(Node)
    modelContentNa: Node;
    @property(Node)
    modelXinren: Node;
    @property(Node)
    modelMoeny: Node;
    @property(Node)
    modelTiles: Node;
    @property(Node)
    xingrenTile: Node;
    @property(Node)
    xinrenSz: Node;
    @property(Node)
    yindaoSz: Node;
    @property(Node)
    yindaoBtn: Node;
    modelInfo: any = null;
    optionData: any = null;
    // modeltype: (string)[] = ['新人/通关/引导', '立即收下']
    show(option: PanelShowOption): void {
        // console.log(this.tmp);
        log('------------------');
        option.onShowed();
        console.log(option.data);
        this.optionData = option.data;

        this.init(option.data);
    }
    // 每次打开都会触发
    protected onEnable(): void {
        // console.log(this.tmp, 111111111);
    }



    hide(option: PanelHideOption): void {
        option.onHided();
    }
    // 只会触发一次
    start() {


    }
    update(deltaTime: number) {

    }
    closeModel() {
        qc.panelRouter.hide({
            panel: PanelConfigs.redEnvelopeModelPanel,
            onHided: () => {
                console.log('close test panel-----------');
                if (this.optionData && this.optionData.closeFunc) {
                    this.optionData.closeFunc();
                }
            }
        });
    }
    init(data: any) {
        // type为0 通关/引导/新人红包 1：开启状态的红包
        this.modelInfo = PlayerMgr.ins.userInfo

        if (data.type == 0) {
            if (this.modelInfo.prompt.type == 1) {
                this.modelFlag.getComponent(CustomSprite).index = 2
                this.modelTiele.getComponent(CustomSprite).index = 0
                this.xingrenTile.getComponent(Label).string = '恭喜获得新人红包 最高奖励10元'
                this.modelContentNa.active = false
                this.modelContentOpen.active = false
                this.modelXinren.active = true
            } else if (this.modelInfo.prompt.type == 2) {
                this.modelFlag.getComponent(CustomSprite).index = 0
                this.modelTiele.getComponent(CustomSprite).index = 3

                this.xingrenTile.getComponent(Label).string = `再玩${this.modelInfo.prompt.remain}关可再额外获得一个红包`
                //    this.modelTiles
                this.modelContentOpen.active = false
                this.modelXinren.active = false
                this.modelContentNa.active = true
                if (this.modelInfo.prompt.can_open) {
                    this.xingrenTile.active = false
                    this.yindaoBtn.active = false
                } else {
                    this.xingrenTile.active = true
                    this.yindaoBtn.active = true
                }
            } else {
                this.xingrenTile.getComponent(Label).string = `再玩${this.modelInfo.prompt.remain}关可再额外获得一个红包`
            }
        } else if (data.type == 1) {
            this.modelFlag.getComponent(CustomSprite).index = 1
            this.modelTiele.getComponent(CustomSprite).index = 5
            this.modelMoeny.getComponent(Label).fontSize = 105
            this.modelMoeny.getComponent(Label).string = Number(data.amount).toFixed(2)
            this.modelXinren.active = false
            this.modelContentNa.active = false
            this.modelContentOpen.active = true
            this.xingrenTile.active = false

        }

    }
    goGame() {
        console.log('跳转到游戏');
        let level = PlayerMgr.ins.userInfo.summary.latest_passed_level + 1;
        let mapid = PlayerMgr.ins.userInfo.summary.map_on;
        LevelMgr.ins.goToLevel(mapid, level, null);
        this.closeModel()
    }
    async getMoney() {
        if (PlayerMgr.ins.userInfo.prompt.can_open == 1) {
            let res = await redModelApi.ins.redpackOpen({
                type: PlayerMgr.ins.userInfo.prompt.type == 1 ? 1 : 2,
                level_no: PlayerMgr.ins.userInfo.prompt.type == 1 ? 0 : Number(PlayerMgr.ins.userInfo.summary.latest_passed_level)
            })
            if (res) {
                if (res.code == 200) {
                   
                    PlayerMgr.ins.addCash(Number(res.data.amount))
                    this.modelFlag.getComponent(CustomSprite).index = 1
                    this.modelMoeny.getComponent(Label).fontSize = 105
                    this.modelMoeny.getComponent(Label).string = Number(res.data.amount).toFixed(2)
                    this.modelXinren.active = false
                    this.modelContentNa.active = false
                    this.modelContentOpen.active = true
                    this.xingrenTile.active = false
                     PlayerMgr.ins.getHomeData();
                }
                console.log(res);

            }
        } else {
            CommonTipsMgr.ins.showTips('请去闯关');
        }


    }
    goTixan() {

    }

}


