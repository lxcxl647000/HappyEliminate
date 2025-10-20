import { _decorator } from 'cc';
import { qc } from '../framework/qc';
import { Constants } from '../game/Constants';
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

    private _vibrateEnabled: boolean = true;
    private _musicEnabled: boolean = true;
    private _soundEnabled: boolean = true;
    private _soundVal: number = 1;
    private _musicVal: number = .8;

    public get vibrateEnabled() {
        let enabled = qc.storage.getItem(Constants.VIBRATE_ENABLED_KEY, true);
        this._vibrateEnabled = enabled;
        return this._vibrateEnabled;
    }
    public set vibrateEnabled(val: boolean) {
        qc.storage.setItem(Constants.VIBRATE_ENABLED_KEY, val);
        this._vibrateEnabled = val;

    }
    public get musicEnabled() {
        let enabled = qc.storage.getItem(Constants.MUSIC_ENABLED_KEY, true);
        this._musicEnabled = enabled;
        return this._musicEnabled;
    }
    public set musicEnabled(val: boolean) {
        qc.storage.setItem(Constants.MUSIC_ENABLED_KEY, val);
        this._musicEnabled = val;
    }

    public get soundEnabled() {
        let enabled = qc.storage.getItem(Constants.SOUND_ENABLED_KEY, true);
        this._soundEnabled = enabled;
        return this._soundEnabled;
    }
    public set soundEnabled(val: boolean) {
        qc.storage.setItem(Constants.SOUND_ENABLED_KEY, val);
        this._soundEnabled = val;
    }

    public get soundVal() {
        let val = qc.storage.getItem(Constants.SoundVal_KEY, 1);
        this._soundVal = val;
        return this._soundVal;
    }
    public set soundVal(val: number) {
        qc.storage.setItem(Constants.SoundVal_KEY, val);
        this._soundVal = val;
    }

    public get musicVal() {
        let val = qc.storage.getItem(Constants.MusicVal_KEY, .8);
        this._musicVal = val;
        return this._musicVal;
    }
    public set musicVal(val: number) {
        qc.storage.setItem(Constants.MusicVal_KEY, val);
        this._musicVal = val;
    }

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


