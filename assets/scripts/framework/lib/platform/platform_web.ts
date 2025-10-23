import { musicMgr } from "../../../manager/musicMgr";
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
        return '3000000137357221';
    }
}