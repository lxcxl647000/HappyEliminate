import { baseConfig } from "../../../configs/baseConfig";
import EventDef from "../../../constants/EventDef";
import { musicMgr } from "../../../manager/musicMgr";
import { qc } from "../../qc";
import platform_interface, { rewardedVideoAd } from "./platform_interface";

class RewardedVideoAd {
    private _tag = '';
    private _isLoaded = false;
    /**
     * 广告实列
     */
    private _rewardedVideoAd: any = null;
    private _adUnitId: string = null;

    private _showCb: Function = null;
    public set showCb(cb: Function) {
        this._showCb = cb;
    }

    private _errorCb: Function = null;
    public set errorCb(cb: Function) {
        this._errorCb = cb;
    }

    private _successCb: Function = null;
    public set successCb(cb: Function) {
        this._successCb = cb;
    }

    private _failCb: Function = null;
    public set failCb(cb: Function) {
        this._failCb = cb;
    }

    constructor(adUnitId: string) {
        this._tag = platform_tt.tag + this._adUnitId;
        this._adUnitId = adUnitId;
        this._rewardedVideoAd = tt.createRewardedVideoAd({
            adUnitId: adUnitId,
            multiton: true,
        });
        this._rewardedVideoAd.onLoad((res) => {
            this._isLoaded = true;
            console.log(this._tag, '广告加载成功');

        });
        this._rewardedVideoAd.onClose((res) => {
            console.log(this._tag, '广告关闭', res);
            if (res.isEnded) {
                this._successCb && this._successCb(res);
            }
            else {
                this._failCb && this._failCb(res);
            }
            this._successCb = null;
            this._failCb = null;
        });
        this._rewardedVideoAd.onError((res) => {
            console.log(this._tag, '广告组件出现问题', res);
            this._errorCb && this._errorCb(res);
            this._errorCb = null;
        });
    }

    public showAD() {
        if (this._isLoaded) {
            this._rewardedVideoAd
                .show()
                .then((res) => {
                    console.log(this._tag, '广告显示成功', res);
                    this._showCb && this._showCb(res);
                    this._showCb = null;
                })
                .catch((err) => {
                    console.log(this._tag, '广告组件出现问题', err);
                    // 再次重试加载一次          
                    this._rewardedVideoAd
                        .load()
                        .then(() => {
                            console.log(this._tag, '手动加载成功', err);
                            this.showAD();
                        });
                })
        } else {
            console.log(`${this._tag} 广告没加载完成`);
        }
    }
}

export default class platform_tt implements platform_interface {
    public static tag = 'tt platform';
    private _rewardedVideoAdMap: Map<string, RewardedVideoAd> = new Map();

    showRewardedAd(ad: rewardedVideoAd): void {
        ad && ad.successCb && ad.successCb();
    }
    init(): void {
        console.log('init tt');
        let adUnitIds = qc.platform.getAllAdUnitIds();
        for (let adUnitId of adUnitIds) {
            this.createRewardedAd(adUnitId);
        }

        tt.onShow((res) => {
            console.log('tt onshow', res);
            this._onShow(res);
        });

        tt.onHide((res) => {
            console.log('tt onhide', res);
            this._onHide(res);
        });
    }

    private _onShow(res: any) {
        qc.eventManager.emit(EventDef.OnShow, res);
    }

    private _onHide(res: any) {
        qc.eventManager.emit(EventDef.OnHide, res);
    }

    createRewardedAd(adUnitId: string) {
        let rewardedVideoAd = new RewardedVideoAd(adUnitId);
        this._rewardedVideoAdMap.set(adUnitId, rewardedVideoAd);
    }

    fromOtherAppToCompleteTask(type: string): void {

    }

    reportScene(sceneId: number): void {

    }

    getShareInfo(cb: Function): void {

    }

    vibrateShort(cb?: Function): void {
        if (tt.vibrateShort) tt.vibrateShort({});
    }

    playMusic(url: string) {
        // 暂时先用cocos的api播放
        musicMgr.ins.playMusicByCocos(url);
    }

    stopMusic() {
        // 暂时先用cocos的api停止
        musicMgr.ins.stopMusicByCocos();
    }

    getAllAdUnitIds(): string[] {
        return [
            '',
        ];
    }

    getAppId(): string {
        return 'tt7c6e0ad3e363816f02';
    }
}