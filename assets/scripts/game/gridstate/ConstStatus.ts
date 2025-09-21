import { IdelState } from "./IdelState";
import { FindMatchState } from "./FindMatchState";
import { FoundMatchState } from "./FoundMatchState";
import { SwapState } from "./SwapState";
import { FillState } from "./FillState";
import { RemoveState } from "./RemoveState";
import { TouchMoveState } from "./TouchMoveState";
import { ToolsState } from "./ToolsState";
import { ErrorState } from "./ErrorState";

export class ConstStatus {
    fillState: FillState;
    findMatchState: FindMatchState;
    foundMatchState: FoundMatchState;
    idelState: IdelState;
    removeState: RemoveState;
    swapState: SwapState;
    touchMoveState: TouchMoveState;
    // 处理道具
    toolsState: ToolsState;

    // 异常状态
    errorState: ErrorState;
    private constructor() {
    }

    private static instance: ConstStatus;
    public static getInstance() {
        if (!this.instance) {
            this.instance = new ConstStatus();
        }
        return this.instance;
    }
}