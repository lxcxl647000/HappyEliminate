
import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { StarScript } from './StarScript';
const { ccclass, property } = _decorator;

export class StarUtils {

    /**
     * 根据星星数量显示星星填充还是空白
     * @param starCounter 
     * @param star1Node 
     * @param star2Node 
     * @param star3Node 
     */
    static changeNodeByCounter(starCounter: number, star1Node: Node, star2Node: Node, star3Node: Node) {
        if (starCounter === 1) {
            star1Node.getComponent(StarScript).setFillOrEmpty(true);
            star2Node.getComponent(StarScript).setFillOrEmpty(false);
            star3Node.getComponent(StarScript).setFillOrEmpty(false);
        } else if (starCounter === 2) {
            star1Node.getComponent(StarScript).setFillOrEmpty(true);
            star2Node.getComponent(StarScript).setFillOrEmpty(true);
            star3Node.getComponent(StarScript).setFillOrEmpty(false);
        } else if (starCounter === 3) {
            star1Node.getComponent(StarScript).setFillOrEmpty(true);
            star2Node.getComponent(StarScript).setFillOrEmpty(true);
            star3Node.getComponent(StarScript).setFillOrEmpty(true);
        } else {          
            star1Node.getComponent(StarScript).setFillOrEmpty(false);
            star2Node.getComponent(StarScript).setFillOrEmpty(false);
            star3Node.getComponent(StarScript).setFillOrEmpty(false); 
        }
    }
}
