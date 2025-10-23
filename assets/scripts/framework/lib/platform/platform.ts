import { SettingMgr } from "../../../manager/SettingMgr";
import adapter from "./adapter/adapter";
import platform_bilibili from "./platform_bilibili";
import platform_interface, { rewardedVideoAd } from "./platform_interface";
import platform_taobao from "./platform_taobao";
import platform_tt from "./platform_tt";
import platform_web from "./platform_web";
import platform_wx from "./platform_wx";

export default class platform implements platform_interface {
    private static TAG: string = "platform";
    private _platform: platform_interface = null;
    public get platform() {
        return this._platform;
    }

    public init() {
        if (adapter.inst.onTaobao()) {
            this._platform = new platform_taobao();
            console.log(platform.TAG + "::init->平台:淘宝小游戏");
        }
        else if (adapter.inst.onBilibili()) {
            this._platform = new platform_bilibili();
            console.log(platform.TAG + "::init->平台:bilibili小游戏");
        }
        else if (adapter.inst.onWx()) {
            this._platform = new platform_wx();
            console.log(platform.TAG + "::init->平台:wx小游戏");
        }
        else if (adapter.inst.onTt()) {
            this._platform = new platform_tt();
            console.log(platform.TAG + "::init->平台:tt小游戏");
        }
        else {
            this._platform = new platform_web();
            console.log(platform.TAG + "::init->平台:web");
        }
        if (this._platform) {
            this._platform.init();
        }
    }

    createRewardedAd(adUnitId: string) {

    }

    showRewardedAd(ad: rewardedVideoAd): void {
        this._platform.showRewardedAd(ad);
    }

    fromOtherAppToShowAd(): void {
        this._platform.fromOtherAppToShowAd();
    }

    reportScene(sceneId: number): void {
        this._platform.reportScene(sceneId);
    }

    getShareInfo(cb: Function): void {
        this._platform.getShareInfo(cb);
    }

    vibrateShort(cb?: Function): void {
        if (SettingMgr.ins.vibrateEnabled) {
            this._platform.vibrateShort(cb);
        }
    }

    playMusic(url: string) {
        this._platform.playMusic(url);
    }

    stopMusic() {
        this._platform.stopMusic();
    }

    getAllAdUnitIds(): string[] {
        return this._platform.getAllAdUnitIds();
    }

    getAppId(): string {
        return this._platform.getAppId();
    }
}