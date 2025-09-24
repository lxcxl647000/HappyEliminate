import { _decorator, Component, view, ResolutionPolicy } from 'cc';
const { ccclass } = _decorator;

@ccclass('FixScene')
export class FixScene extends Component {
    protected onLoad(): void {
        const visibleSize = view.getVisibleSize();
        const designRatio = 720 / 1280;
        const screenRatio = visibleSize.width / visibleSize.height;

        if (screenRatio < designRatio) {
            // 固定宽度，高度自适应
            view.setDesignResolutionSize(720, 1280, ResolutionPolicy.FIXED_WIDTH);
        } else {
            // 固定高度，宽度自适应
            view.setDesignResolutionSize(720, 1280, ResolutionPolicy.FIXED_HEIGHT);
        }
    }
}