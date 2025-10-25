export default interface platform_interface {
    init(): void

    // 激励广告//
    createRewardedAd(adUnitId: string): any
    showRewardedAd(ad: rewardedVideoAd): void
    // 从其他小程序跳过来完成任务：闯关、看广告//
    fromOtherAppToCompleteTask(type: string): void
    // 上报场景值//
    reportScene(sceneId: number): void
    // 获取分享信息//
    getShareInfo(cb: Function): void
    // 短震动
    vibrateShort(cb?: Function): void
    // 播放音乐
    playMusic(url: string): void
    // 停止音乐
    stopMusic(): void
    // 获取所有广告位
    getAllAdUnitIds(): string[]
    // 获取appid
    getAppId(): string
}

export interface rewardedVideoAd {
    adUnitId: string,
    showCb?: Function,
    successCb?: Function,
    failCb?: Function,
    errorCb?: Function
}