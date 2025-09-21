import { randomRangeInt } from "cc";
import { Grid } from "../Grid";
import { Cell } from "../Types";
import { ITool, ToolType } from "./ITool";
import { CellUtils } from "../gameutils/CellUtils";

/**
 * 随机打乱，并交换位置
 */
export class RandomTool implements ITool {
    getType(): ToolType {
        return ToolType.RANDOM_GRID
    }
 
    process(cell: Cell, grid: Grid, onComplete: () => void) {

        // 选择有效的位置来生成，避免随机到无效的位置
        const validCells = [];
        grid.rangeCells((c: Cell, i: number, j: number) => {
           if (c.isValid()) {
            validCells.push(c);
           }
        });
        
        for (const c of validCells) {
            let randomCell = validCells[randomRangeInt(0, validCells.length)];
            grid.swapCell(c, randomCell);
        }

        for (let index = 0; index < validCells.length; index++) {
            const cell = validCells[index];
            if (index === validCells.length - 1) {
                // 最后一个转换完成，则进行销毁
                CellUtils.changePostion(cell, grid, onComplete);
            } else {
                CellUtils.changePostion(cell, grid);
            }
        }


        // grid.rangeCells((c: Cell, i: number, j: number) => {
        //     let randomCell = validCells[randomRangeInt(0, validCells.length)];
        //     grid.swapCell(c, randomCell);
        // });

        // grid.rangeCells((cell: Cell, i: number, j: number) => {
        //     if (i === grid.rows - 1 && j === grid.cols - 1) {   
        //         // 最后一个转换完成，则进行销毁
        //         CellUtils.changePostion(cell, grid, onComplete);
        //     } else { 
        //         CellUtils.changePostion(cell, grid);
        //     }
        // });

    }


}