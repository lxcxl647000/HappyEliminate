import { _decorator, assetManager, AssetManager, ImageAsset, SpriteFrame, Component, instantiate, Label, log, Mask, Node, Sprite, Texture2D } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import { item } from './taskNode';

const { ccclass, property } = _decorator;
@ccclass('chengjiuPanel')
export class chengjiuPanel extends PanelComponent {
    @property(Node)
    content: Node = null;
    @property(Node)
    item: Node = null;
    @property(Label)
    title: Label = null;
    @property(Label)
    redMoney: Label = null;
    taskList: any = []
    show(option: PanelShowOption): void {
        // console.log(this.tmp);
        log('------------------');
        option.onShowed();
        this.init();
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
      
        
    }
    update(deltaTime: number) {

    }
    closeModel() {
        qc.panelRouter.hide({
            panel: PanelConfigs.redEnvelopePanel,
            onHided: () => {
                console.log('close test panel-----------');

            }
        });
    }
    init() {
        this.taskList = [
            {
                taskName: '任务1',
                taskNum: 10,
                taskAllNum: 100,
                taskReamake: '闯关100关',
                taskState: 0,
                taskImg: 'https://cdn.yundps.com/new/2025/09/18/15/2ad511e08ef0593e6f3b85c834b9ae2c.png'

            },
            {
                taskName: '任务1',
                taskNum: 100,
                taskAllNum: 100,
                taskReamake: '闯关100关',
                taskState: 1,
                taskImg: 'https://cdn.yundps.com/new/2025/09/18/15/2ad511e08ef0593e6f3b85c834b9ae2c.png'

            },
            {
                taskName: '任务1',
                taskNum: 100,
                taskAllNum: 100,
                taskReamake: '闯关100关',
                taskState: 1,
                taskImg: 'https://cdn.yundps.com/new/2025/09/18/15/2ad511e08ef0593e6f3b85c834b9ae2c.png'

            },
            {
                taskName: '任务1',
                taskNum: 100,
                taskAllNum: 100,
                taskReamake: '闯关100关',
                taskState: 1,
                taskImg: 'https://cdn.yundps.com/new/2025/09/18/15/2ad511e08ef0593e6f3b85c834b9ae2c.png'

            },
            {
                taskName: '任务1',
                taskNum: 100,
                taskAllNum: 100,
                taskReamake: '闯关100关',
                taskState: 1,
                taskImg: 'https://cdn.yundps.com/new/2025/09/18/15/2ad511e08ef0593e6f3b85c834b9ae2c.png'

            },
            {
                taskName: '任务1',
                taskNum: 100,
                taskAllNum: 100,
                taskReamake: '闯关100关',
                taskState: 1,
                taskImg: 'https://cdn.yundps.com/new/2025/09/18/15/2ad511e08ef0593e6f3b85c834b9ae2c.png'

            }
        ]
        this.taskList.forEach(element => {
            let itemNode = instantiate(this.item)
            itemNode.getComponent(item).setDate(element)
            itemNode.active = true
            this.content.addChild(itemNode)
        });
        // 显示红包金额
        this.redMoney.string = '8.8'
        this.title.string = '最高8.8元，轻松到账'
    }

}


