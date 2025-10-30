import { BlockErrState } from "./BlockErrState";
import { BlockFillState } from "./BlockFillState";
import { BlockFindState } from "./BlockFindState";
import { BlockFoundState } from "./BlockFoundState";
import { BlockIdleState } from "./BlockIdleState";
import { BlockRemoveState } from "./BlockRemoveState";
import { BlockSwapState } from "./BlockSwapState";
import { BlockToolState } from "./BlockToolState";
import { BlockTouchMoveState } from "./BlockTouchMoveState";

export default class GameStateMgr {
    private static _ins: GameStateMgr = null;
    public static get ins() {
        if (this._ins == null) {
            this._ins = new GameStateMgr();
        }
        return this._ins;
    }

    blockFill: BlockFillState;
    blockFind: BlockFindState;
    blockFound: BlockFoundState;
    blockIdle: BlockIdleState;
    blockRemove: BlockRemoveState;
    blockSwap: BlockSwapState;
    blockTouchMove: BlockTouchMoveState;
    blockTool: BlockToolState;
    blockErr: BlockErrState;
}