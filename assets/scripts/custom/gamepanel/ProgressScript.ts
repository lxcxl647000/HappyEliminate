import { _decorator, Component, Node, ProgressBar, Size, tween, UITransform, Vec3 } from 'cc';
import { StarUtils } from './StarUtils';
import { Constants } from '../../game/Constants';
const { ccclass, property } = _decorator;

@ccclass('ProgressScript')
export class ProgressScript extends Component {

    @property(Node)
    start1Node: Node;

    @property(Node)
    start2Node: Node;

    @property(Node)
    start3Node: Node;

    @property(ProgressBar)
    progressBar: ProgressBar;

    // 记录进度, 默认0，最大值100
    private progress: number = 0;
    private starCounter: number = 0;

    private isInited: boolean = false;

    start() {
        this.isInited = true;
        // 设置默认的进度
        this.setProgress(0);
    }

    update(deltaTime: number) {

    }

    // 进度条会限制到0~100之间
    setProgress(progress: number, onFinish?: () => void) {
        this.progress = Math.min(Math.max(0, progress), 100);
        if (!this.isInited) {
            return;
        }
        this.updateStarCounter();
        this.updateNodes(onFinish);
    }

    getStarCountr(): number {
        return this.starCounter;
    }

    /**
     * 根据progress 计算star
     */
    private updateStarCounter() {
        if (this.progress > 99) {
            this.starCounter = 3;
        } else if (this.progress > 66) {
            this.starCounter = 2;
        } else if (this.progress > 40) {
            this.starCounter = 1;
        } else {
            this.starCounter = 0;
        }
    }

    private updateNodes(onFinish?: () => void) {
        // progress
        let progressValue = this.progress / 100;
        tween(this.progressBar)
            .to(Constants.PROGRESS_CHANGE_DURATION, { progress: progressValue })
            .call(() => {
                if (onFinish) {
                    onFinish();
                }
            })
            .start();

        // star
        StarUtils.changeNodeByCounter(this.starCounter, this.start1Node, this.start2Node, this.start3Node);
    }
}


