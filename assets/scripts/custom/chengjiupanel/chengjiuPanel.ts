import { _decorator, assetManager, AssetManager, ImageAsset, SpriteFrame, Component, instantiate, Label, log, Mask, Node, Sprite, Texture2D } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import { contentItem } from '../componetUtils/contentItem';
import ListCom from '../../framework/lib/components/scrollviewplus/ListCom';
const { ccclass, property } = _decorator;
@ccclass('chengjiuPanel')
export class chengjiuPanel extends PanelComponent {
    // 任务节点
    @property(Node)
    taskNode: Node = null;
    // 装任务的容器
    @property(Node)
    taskListNode: Node = null;

    @property(ListCom)
    list:ListCom = null;

    taskList: any[] = []

    show(option: PanelShowOption): void {
        // console.log(this.tmp);
        log('------------------');
        option.onShowed();
    }
    // 每次打开都会触发
    protected onEnable(): void {
        // console.log(this.tmp, 111111111);
    }



    hide(option: PanelHideOption): void {
        option.onHided();
    }
    // 只会触发一次
    start() {
        this.init();
    }
    update(deltaTime: number) {

    }
    closeModel() {
        qc.panelRouter.hide({
            panel: PanelConfigs.chengjiuPanel,
            onHided: () => {
                console.log('close test panel-----------');

            }
        });
    }
    init() {
        this.taskList = [{
            name: '任务1',
            taskAllNum: 10000,
            taskNum: 5000,
            taskProgress: 0.5,
            taskState: 1,
            Reward: [
                { type: 1, num: 20 },
                { type: 2, num: 10 },
                { type: 2, num: 10 },
                { type: 2, num: 10 },
            ]

        },
        {
            name: '任务2',
            taskAllNum: 10,
            taskNum: 6,
            taskProgress: 0.6,
            taskState: 0,
            Reward: [
                { type: 1, num: 20 },
            ]

        },
        {
            name: '任务2',
            taskAllNum: 10,
            taskNum: 6,
            taskProgress: 0.6,
            taskState: 0,
            Reward: [
                { type: 1, num: 20 },
            ]

        },
        {
            name: '任务2',
            taskAllNum: 10,
            taskNum: 6,
            taskProgress: 0.6,
            taskState: 0,
            Reward: [
                { type: 1, num: 20 },
            ]

        },
        {
            name: '任务2',
            taskAllNum: 10,
            taskNum: 6,
            taskProgress: 0.6,
            taskState: 0,
            Reward: [
                { type: 1, num: 20 },
            ]

        },
        {
            name: '任务2',
            taskAllNum: 10,
            taskNum: 6,
            taskProgress: 0.6,
            taskState: 0,
            Reward: [
                { type: 1, num: 20 },
            ]

        },
        {
            name: '任务2',
            taskAllNum: 10,
            taskNum: 6,
            taskProgress: 0.6,
            taskState: 0,
            Reward: [
                { type: 1, num: 20 },
            ]

        },
        {
            name: '任务2',
            taskAllNum: 10,
            taskNum: 6,
            taskProgress: 0.6,
            taskState: 0,
            Reward: [
                { type: 1, num: 20 },
            ]

        },
        {
            name: '任务2',
            taskAllNum: 10,
            taskNum: 6,
            taskProgress: 0.6,
            taskState: 0,
            Reward: [
                { type: 1, num: 20 },
            ]

        },
        {
            name: '任务2',
            taskAllNum: 10,
            taskNum: 6,
            taskProgress: 0.6,
            taskState: 0,
            Reward: [
                { type: 1, num: 20 },
            ]

        }
    ]

    this.list.numItems = this.taskList.length;

        // this.taskList.forEach(async (item, index) => {
        //     let itemNode = instantiate(this.taskNode);

        //     itemNode.active = true;

        //     await itemNode.getComponent(contentItem).setData(item)
        //     console.log(1111111111111);

        //     this.taskListNode.addChild(itemNode);
        // })

    }

    onRenderRenwuItem(item: Node, index: number) {
        item.active = true;
        let chengjiu = item.getComponent(contentItem);
        if (chengjiu) {
            chengjiu.setData(this.taskList[index]);
        }
    }
}


