import { _decorator, Component, Node, ProgressBar, tween } from 'cc';
import { GameConstant } from '../../game/GameConstant';
import CustomSprite from '../componetUtils/CustomSprite';
const { ccclass, property } = _decorator;

@ccclass('StarProgress')
export class StarProgress extends Component {
    @property(CustomSprite)
    star1: CustomSprite;
    @property(CustomSprite)
    star2: CustomSprite;
    @property(CustomSprite)
    star3: CustomSprite;
    @property(ProgressBar)
    progressBar: ProgressBar;

    private progress: number = 0;
    private starCount: number = 0;

    private _isInited: boolean = false;

    start() {
        this._isInited = true;
        this.setProgress(0);
    }

    setProgress(progress: number, onFinish?: () => void) {
        this.progress = Math.min(Math.max(0, progress), 100);
        if (!this._isInited) {
            return;
        }
        this.updateStarCount();
        this.updateStarProgress(onFinish);
    }

    getStarCount(): number {
        return this.starCount;
    }

    private updateStarCount() {
        if (this.progress > 99) {
            this.starCount = 3;
        } else if (this.progress > 66) {
            this.starCount = 2;
        } else if (this.progress > 40) {
            this.starCount = 1;
        } else {
            this.starCount = 0;
        }
    }

    private updateStarProgress(onFinish?: () => void) {
        let progressValue = this.progress / 100;
        tween(this.progressBar)
            .to(GameConstant.ChangeProgressTime, { progress: progressValue })
            .call(() => {
                if (onFinish) {
                    onFinish();
                }
            })
            .start();

        this.star1.index = this.starCount >= 1 ? 0 : 1;
        this.star2.index = this.starCount >= 2 ? 0 : 1;
        this.star3.index = this.starCount >= 3 ? 0 : 1;
    }
}
