import { AudioClip } from "cc";
import EventDef from "../../../constants/EventDef";
import { SettingMgr } from "../../../manager/SettingMgr";
import CocosUtils from "../../../utils/CocosUtils";
import { qc } from "../../qc";
import { tbCloudMgr } from "../net/tbCloudMgr";
import platform_interface, { rewardedVideoAd } from "./platform_interface";
import { BundleConfigs } from "../../../configs/BundleConfigs";
import { PlatformConfig } from "./configs/PlatformConfig";
const my = globalThis['my'];

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
        this._tag = platform_taobao.tag + this._adUnitId;
        this._adUnitId = adUnitId;
        this._rewardedVideoAd = my['createRewardedAd']({ adUnitId });
        this._rewardedVideoAd.onLoad((res) => {
            this._isLoaded = true;
            console.log(this._tag, '广告加载成功');

        });
        this._rewardedVideoAd.onClose((res) => {
            console.log(this._tag, '广告关闭', res);
            if (res.isCompleted) {
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

export default class platform_taobao implements platform_interface {
    public static tag = 'taobao platform';
    private _rewardedVideoAdMap: Map<string, RewardedVideoAd> = new Map();
    private _innerAudioContext = null;
    private _isOnShow = true;
    showRewardedAd(ad: rewardedVideoAd): void {
        let rewardedVideoAd = this._rewardedVideoAdMap.get(ad.adUnitId);
        if (rewardedVideoAd) {
            rewardedVideoAd.showCb = ad.showCb;
            rewardedVideoAd.successCb = ad.successCb;
            rewardedVideoAd.failCb = ad.failCb;
            rewardedVideoAd.errorCb = ad.errorCb;
            rewardedVideoAd.showAD();
        }
        else {
            console.log(`${platform_taobao.tag + ad.adUnitId}广告未加载成功`);
        }
    }
    init() {
        console.log('init taobao');
        let adUnitIds = PlatformConfig.ins.config.adUnitIds;
        for (let adUnitId of adUnitIds) {
            this.createRewardedAd(adUnitId);
        }

        my['onShow']((res) => {
            this._isOnShow = true;
            console.log('taobao onshow', res);
            this._onShow(res);
        });

        my['onHide']((res) => {
            this._isOnShow = false;
            console.log('taobao onhide', res);
            this._onHide(res);
        });

        my['setKeepScreenOn']({
            keepScreenOn: true,
        });

        this._innerAudioContext = my['createInnerAudioContext']();
        this._innerAudioContext['_loop'] = true;
        this._innerAudioContext['loop'] = true;
        this._innerAudioContext.onPlay(() => {
            console.log('开始播放 ', this._innerAudioContext.loop);
            if (!this._isOnShow || !SettingMgr.ins.musicEnabled) {
                this.stopMusic();
            }
        });
        this._innerAudioContext.onError((res) => {
            console.log('播放错误  ', res.errMsg)
        });
        this._innerAudioContext.onEnded(() => {
            console.log('播放结束    ', this._innerAudioContext.loop);
        });
    }

    createRewardedAd(adUnitId: string) {
        let rewardedVideoAd = new RewardedVideoAd(adUnitId);
        this._rewardedVideoAdMap.set(adUnitId, rewardedVideoAd);
    }

    private _onShow(res: any) {
        qc.eventManager.emit(EventDef.OnShow, res);
    }

    private _onHide(res: any) {
        qc.eventManager.emit(EventDef.OnHide, res);
    }

    reportScene(sceneId: number): void {
        const SDK = my['tb'].getInteractiveSDK()
        console.log('reportScene--------------', sceneId, SDK);

        SDK.reportScene({
            sceneId: sceneId,
            timestamp: Date.now(),
            costTime: 2000,
        })
    }

    getShareInfo(cb: Function): void {
        const sdk = my['tb'].getInteractiveSDK();
        let shareInfo = sdk.getShareInfo(); // 具体使用请参考getShareInfo文档
        console.log('淘宝分享参数', shareInfo.querys)
        if (shareInfo.querys) {
            if (shareInfo.querys.adzoneId) {
                PlatformConfig.ins.config.adzoneId = shareInfo.querys.adzoneId;
            }
            qc.platform.hdkf_share_info = shareInfo.querys;
        }
        else {
            qc.platform.hdkf_share_info = null;
        }
        cb && cb();
    }

    vibrateShort(cb?: Function): void {
        my['vibrateShort']({
            success: () => {
                cb && cb();
            }
        });
    }

    playMusic(url: string) {
        CocosUtils.loadFromBundle<AudioClip>(BundleConfigs.audioBundle, url, AudioClip).then((clip: AudioClip) => {
            console.log('nativeurl----------------- ', clip.nativeUrl);
            this._innerAudioContext.src = clip.nativeUrl;
            this._innerAudioContext.play();
        });
    }

    stopMusic() {
        this._innerAudioContext.stop();
    }

    login(cb: Function): void {
        tbCloudMgr.ins.init(cb);
    }

    updateKeyboard(str: string): void {
    }
}