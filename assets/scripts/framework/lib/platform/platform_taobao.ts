import { AudioClip } from "cc";
import { baseConfig } from "../../../configs/baseConfig";
import EventDef from "../../../constants/EventDef";
import CommonTipsMgr from "../../../manager/CommonTipsMgr";
import { SettingMgr } from "../../../manager/SettingMgr";
import CocosUtils from "../../../utils/CocosUtils";
import { qc } from "../../qc";
import { tbCloudMgr } from "../net/tbCloudMgr";
import platform_interface, { rewardedVideoAd } from "./platform_interface";
import { BundleConfigs } from "../../../configs/BundleConfigs";
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
        tbCloudMgr.ins.init();
        let adUnitIds = qc.platform.getAllAdUnitIds();
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

    fromOtherAppToShowAd(): void {
        let res = my['getStorageSync']({ key: 'hdkf_share_info' });
        if (JSON.parse(res.data).taskSign) {

            // JSON.parse(res.data).adTime
            let num = 0
            if (JSON.parse(res.data).adTime == 15) {
                num = 1
            }
            console.log(JSON.parse(res.data), '数据', JSON.parse(res.data).taskSign);
            setTimeout(() => {
                let ad: rewardedVideoAd = {
                    adUnitId: qc.platform.getAllAdUnitIds()[num],
                    successCb: () => {
                        let res = my['getStorageSync']({ key: 'hdkf_share_info' });
                        let TaskValue = JSON.parse(res.data).taskSign

                        let url = `https://mobile.yundps.com/TaoBaoCallback/taskCallback?taskSign=${TaskValue}`;
                        let httpRequest = new XMLHttpRequest(); //第一步：建立所需的对象
                        httpRequest.open('GET', url, true); //第二步：打开连接  将请求参数写在url中  ps:"./Ptest.php?name=test&nameone=testone"
                        httpRequest.send(); //第三步：发送请求  将请求参数写在URL中
                        /**
                        * 获取数据后的处理程序
                        */
                        httpRequest.onreadystatechange = function () {
                            if (httpRequest.readyState == 4 && httpRequest.status == 200) {
                                var json = httpRequest.responseText; //获取到json字符串，还需解析
                                console.log(json, '发送了请求');
                                CommonTipsMgr.ins.showTips('浏览已完成');
                                my['removeStorageSync']({
                                    key: 'hdkf_share_info',
                                });
                            } else {

                            }
                        };
                    },
                    failCb: (e) => {
                        if (!e.isCompleted) {
                            CommonTipsMgr.ins.showTips('浏览未完成');
                        }

                    },
                    errorCb: () => {
                        CommonTipsMgr.ins.showTips('浏览未完成');
                    }

                }
                qc.platform.showRewardedAd(ad);

            }, 1500);
        }
    }

    reportScene(sceneId: number): void {
        const SDK = my['tb'].getInteractiveSDK()
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
                baseConfig.adzoneId = shareInfo.querys.adzoneId;
            }
            my['setStorageSync']({
                key: 'hdkf_share_info',
                data: JSON.stringify(shareInfo.querys)
            });
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

    getAllAdUnitIds(): string[] {
        return [
            'mm_35753112_3352750338_116152650086',// 激励广告_30//
            'mm_35753112_3352750338_116157550320'
        ];
    }

    getAppId(): string {
        return '3000000137357221';
    }
}