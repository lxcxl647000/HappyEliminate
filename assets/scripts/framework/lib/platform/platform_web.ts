import platform_interface, { rewardedVideoAd } from "./platform_interface";

export default class platform_web implements platform_interface {
    showRewardedAd(ad: rewardedVideoAd): void {
        ad && ad.successCb && ad.successCb();
    }
    init(): void {

    }
    createRewardedAd(adUnitId: string) {

    }

    fromOtherAppToShowAd(): void {
    }

    reportScene(sceneId: number): void {

    }

    getShareInfo(cb: Function): void {

    }

    vibrateShort(cb?: Function): void {

    }
}