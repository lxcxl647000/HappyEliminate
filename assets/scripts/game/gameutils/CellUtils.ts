import { Vec2 } from "cc";
import { Grid } from "../Grid";
import { Cell } from "../Types";
import { CellScript } from "../../custom/gamepanel/CellScript";

export class CellUtils {

    /**
     * 修改Cell的位置， 带有回调
     */
    public static changePostion(cell: Cell, grid: Grid, onComplete?: () => void) {
        let cellScript = cell.node.getComponent(CellScript);
        let vec2Temp = new Vec2(0);
        grid.gridIDToPos(cell.gridID, vec2Temp);
        if (cell.x !== vec2Temp.x || cell.y !== vec2Temp.y) {
            cell.x = vec2Temp.x;
            cell.y = vec2Temp.y;
            // 触发移动
            cellScript.setPosition(cell.x, cell.y, true, onComplete);
        } else {
            if (onComplete) {
                onComplete();
            }
        }
    }
}