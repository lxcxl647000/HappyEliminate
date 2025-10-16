import { _decorator, Button, Component, log, Node } from 'cc';
import { musicMgr } from '../manager/musicMgr';
const { ccclass, property } = _decorator;

@ccclass('CommonButton')
export class CommonButton extends Button {

    start() {
        let events = this.clickEvents;
        for (let e of events) {
            let clickFunc = e.component[e.handler];
            if (clickFunc) {
                clickFunc = () => {
                    musicMgr.ins.playSound('click');
                    clickFunc();
                };
            }
        }
    }
}


