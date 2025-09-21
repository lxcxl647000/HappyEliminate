import { _decorator, Component, Node } from 'cc';
import { CellType } from './../Types';
const { ccclass, property } = _decorator;

@ccclass('Goal')
export class Goal extends Component {


    /*
        根据目标不同选择不同的显示方式
        1、 纯分数
        2、 消除指定类型，指定数量，完成前显示数字，完成后画√
    */

    start() {

    }

    update(deltaTime: number) {
        
    }

    setGoal() {

    }

    /**
     * 更新分数
     */
    updateScore() {

    }

    /**
     * 更新新删除的类型
     * @param type 
     * @param counter 
     */
    updateNewRemoveCounter(type : CellType, counter : number) {

    }

    updateNodes() {

    }
}


