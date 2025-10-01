import platform_interface, { rewardedVideoAd } from "./platform_interface";

export default class platform_web implements platform_interface {
    showRewardedAd(ad: rewardedVideoAd): void {
        ad && ad.successCb && ad.successCb();
    }
    init(): void {

    }
    createRewardedAd(adUnitId: string) {

    }

}