import { _decorator, instantiate, Label, log, Node, Color } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import { item } from './taskNode';
import cgRedEvApi from '../../api/cgRedEv';
import { carousel } from './carousel';
import CustomSprite from '../componetUtils/CustomSprite';
import PlayerMgr from '../../manager/PlayerMgr';
import LevelMgr from '../../manager/LevelMgr';
import EventDef from '../../constants/EventDef';


const { ccclass, property } = _decorator;
@ccclass('redEnvelopePanel')
export class chengjiuPanel extends PanelComponent {
    @property(Node)
    content: Node = null;
    @property(Node)
    item: Node = null;
    @property(Label)
    title: Label = null;
    @property(Label)
    redMoney: Label = null;
    @property(carousel)
    carousel: carousel = null;
    @property(Node)
    taskopen: Node = null;
    @property(Node)
    taskFlag: Node = null;
    taskList: any = []
    task_done: any = null
    show(option: PanelShowOption): void {
        // console.log(this.tmp);
        log('------------------');
        option.onShowed();
        this.init();
        qc.eventManager.emit(EventDef.Close_Loading);
    }



    hide(option: PanelHideOption): void {
        option.onHided();
    }
    // 只会触发一次
    start() {


    }
    update(deltaTime: number) {

    }
    closeModel() {
        this.carousel.removeCarousel();
        qc.panelRouter.hide({
            panel: PanelConfigs.redEnvelopePanel,
            onHided: () => {
                console.log('close test panel-----------');

            }
        });
    }
    init() {
        cgRedEvApi.ins.passStatus().then((res) => {
            this.task_done = res.data.task_done
            this.carousel.show(res.data.recent)

            this.taskList = [
                {
                    taskName: '任务1',
                    taskNum: res.data.passed_today,
                    taskAllNum: 10,
                    taskReamake: '闯关10关',
                    taskState: res.data.passed_today >= 10 ? 1 : 0,
                    taskImg: 0

                },
                {
                    taskName: '任务1',
                    taskNum: res.data.task_done,
                    taskAllNum: 10,
                    taskReamake: '做10个任务',
                    taskState: res.data.task_done >= 10 ? 1 : 0,
                    taskImg: 1

                }
            ]
            this.content.removeAllChildren()
            this.taskList.forEach(element => {
                let itemNode = instantiate(this.item)
                itemNode.getComponent(item).setDate(element)
                itemNode.active = true
                this.content.addChild(itemNode)
            });
            // 显示红包金额
            this.redMoney.string = '8.8'
            this.title.string = '最高8.8元，轻松到账'
        });

    }
    open() {
        cgRedEvApi.ins.redpackPassOpen().then((res) => {
            if (res) {
                this.taskFlag.getComponent(CustomSprite).index = 1
                this.taskopen.active = false
                PlayerMgr.ins.addCash(Number(res.data.amount))
                this.redMoney.string = Number(res.data.amount).toFixed(2)
                this.redMoney.color = new Color(243, 23, 23, 255)
            }
        });
    }
    btnClick(e) {
        if (e.target.type == 0 && e.target.data == 0) {
            let level = PlayerMgr.ins.userInfo.summary.latest_passed_level + 1;
            let mapid = PlayerMgr.ins.userInfo.summary.map_on;
            LevelMgr.ins.goToLevel(mapid, level, null);
            this.closeModel()
        }
        if (e.target.type == 1 && e.target.data == 0) {

            qc.panelRouter.showPanel({
                panel: PanelConfigs.taskPanel
            });
            this.closeModel()
            console.log('去完成任务');

        }
    }
}


