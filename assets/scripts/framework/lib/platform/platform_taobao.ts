import { baseConfig } from "../../../configs/baseConfig";
import EventDef from "../../../constants/EventDef";
import CommonTipsMgr from "../../../manager/CommonTipsMgr";
import { qc } from "../../qc";
import { tbCloudMgr } from "../net/tbCloudMgr";
import platform_interface, { rewardedVideoAd } from "./platform_interface";
const my = globalThis['my'];

export class RewardedVideoAd {
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

    private _closeCb: Function = null;
    public set closeCb(cb: Function) {
        this._closeCb = cb;
    }

    private _errorCb: Function = null;
    public set errorCb(cb: Function) {
        this._errorCb = cb;
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
            this._closeCb && this._closeCb(res);
            this._closeCb = null;
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
            console.log(`taobao ${this._adUnitId}广告没加载完成`);
        }
    }
}

export default class platform_taobao implements platform_interface {
    public static tag = 'taobao platform';
    private _rewardedVideoAdMap: Map<string, RewardedVideoAd> = new Map();
    showRewardedAd(ad: rewardedVideoAd): void {
        let rewardedVideoAd = this._rewardedVideoAdMap.get(ad.adUnitId);
        if (rewardedVideoAd) {
            rewardedVideoAd.showCb = ad.successCb;
            rewardedVideoAd.closeCb = ad.failCb;
            rewardedVideoAd.errorCb = ad.errorCb;
            rewardedVideoAd.showAD();
        }
        else {
            console.log(`${platform_taobao.tag + ad.adUnitId}广告未加载成功`);
        }
    }
    init() {
        tbCloudMgr.ins.init();
        for (let adUnitId of baseConfig.adUnitIds) {
            this.createRewardedAd(adUnitId);
        }
        console.log('init taobao');

        my['onShow']((res) => {
            console.log('taobao onshow', res);
            this._onShow(res);
        });

        my['onHide']((res) => {
            console.log('taobao onhide', res);
            this._onHide(res);
        });

        my['setKeepScreenOn']({
            keepScreenOn: true,
        })
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
                    adUnitId: baseConfig.adUnitIds[num],
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
}