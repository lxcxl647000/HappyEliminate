import Login from "../../../api/Login";
import EventDef from "../../../constants/EventDef";
import { musicMgr } from "../../../manager/musicMgr";
import { qc } from "../../qc";
import { PlatformConfig } from "./configs/PlatformConfig";
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

export interface ttLaunch {
    scene: string;
    launch_from?: string;
    location?: string;
}

export default class platform_tt implements platform_interface {
    public static tag = 'tt platform';
    private _rewardedVideoAdMap: Map<string, RewardedVideoAd> = new Map();

    showRewardedAd(ad: rewardedVideoAd): void {
        // 没有广告位之前直接返回失败
        ad && ad.failCb && ad.failCb();
    }
    init(): void {
        console.log('init tt');
        tt.onShow((res) => {
            console.log('tt onshow', res);
            qc.platform.ttLaunch = {
                scene: res.scene,
                launch_from: res.launch_from,
                location: res.location
            };
            this._onShow(res);
        });

        tt.onHide((res) => {
            console.log('tt onhide', res);
            this._onHide(res);
        });
        let adUnitIds = PlatformConfig.ins.config.adUnitIds;
        for (let adUnitId of adUnitIds) {
            this.createRewardedAd(adUnitId);
        }
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

    reportScene(sceneId: number): void {

    }

    getShareInfo(cb: Function): void {
        let { query, scene, extra } = tt.getLaunchOptionsSync();
        console.log('tt launchOptions-------  query: ', query, '  scene: ', scene, '  extra: ', extra);
        qc.platform.ttLaunch = {
            scene: scene,
            launch_from: extra.launch_from,
            location: extra.location
        };
        if (query) {
            if (query.adzoneId) {
                PlatformConfig.ins.config.adzoneId = query.adzoneId;
            }
            qc.platform.hdkf_share_info = query;
        }
        else {
            qc.platform.hdkf_share_info = null;
        }
        cb && cb();
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

    login(cb: Function): void {
        tt.login({
            success(res) {
                console.log(`login 调用成功${res.code}`);
                Login.ins.login('/Public/tiktokLogin', { code: res.code }, cb);
            },
            fail(res) {
                console.log(`login 调用失败`, res);
            },
        });
    }

    updateKeyboard(str: string): void {
        tt.updateKeyboard({ value: str });
    }

    checkScene(cb: Function) {
        tt.checkScene({
            scene: "sidebar",
            success: (res) => {
                console.log("check scene success: ", res.isExist);
                //成功回调逻辑
                cb && cb(res.isExist);
            },
            fail: (res) => {
                console.log("check scene fail:", res);
                //失败回调逻辑
                cb && cb(false);
            }
        });
    }

    navigateToScene(scene: string) {
        tt.navigateToScene({
            scene: scene,
            success: (res) => {
                console.log("navigate to scene success");
                // 跳转成功回调逻辑
            },
            fail: (res) => {
                console.log("navigate to scene fail: ", res);
                // 跳转失败回调逻辑
            },
        });
    }
}