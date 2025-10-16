export default interface platform_interface {
    init(): void

    // 激励广告//
    createRewardedAd(adUnitId: string): any
    showRewardedAd(ad: rewardedVideoAd): void
    // 从其他小程序跳过来看广告//
    fromOtherAppToShowAd(): void
    // 上报场景值//
    reportScene(sceneId: number): void
    // 获取分享信息//
    getShareInfo(cb: Function): void
    // 短震动
    vibrateShort(cb?: Function): void
}

export interface rewardedVideoAd {
    adUnitId: string,
    showCb?: Function,
    successCb?: Function,
    failCb?: Function,
    errorCb?: Function
}