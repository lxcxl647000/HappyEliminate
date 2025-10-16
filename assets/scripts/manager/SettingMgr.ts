import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('shezhiMgr')
export class SettingMgr {
    private static _ins: SettingMgr = null;
    public static get ins() {
        if (this._ins == null) {
            this._ins = new SettingMgr();
        }
        return this._ins;
    }

    public vibrateEnabled: boolean = true;
    public musicEnabled: boolean = true;
    public soundEnabled: boolean = true;
    public soundVal: number = 1;
    public musicVal: number = 1;

    public initMusic() {
        if (this.musicEnabled) {
            this.musicVal = 0.8
        } else {
            this.musicVal = 0
        }
    }

    public initSound() {
        if (this.soundEnabled) {
            this.soundVal = 1;
        }
        else {
            this.soundVal = 0
        }
    }
}


