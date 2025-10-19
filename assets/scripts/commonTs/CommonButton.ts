import { _decorator, Button } from 'cc';
import { musicMgr } from '../manager/musicMgr';
const { ccclass, property } = _decorator;

@ccclass('CommonButton')
export class CommonButton extends Button {

    start() {
        let events = this.clickEvents;
        for (let e of events) {
            if (e.target) {
                let component = e.target.getComponent(e._componentName);
                if (component) {
                    let clickFunc = e.target.getComponent(e._componentName)[e.handler].bind(component);
                    if (clickFunc) {
                        e.target.getComponent(e._componentName)[e.handler] = () => {
                            musicMgr.ins.playSound('click');
                            clickFunc();
                        };
                    }
                }
            }
        }
    }
}


