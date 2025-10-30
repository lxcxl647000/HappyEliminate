import { _decorator, Component, ProgressBar } from "cc";
import { PanelHideOption, PanelShowOption } from "../../framework/lib/router/PanelComponent";
import { PanelConfigs } from "../../configs/PanelConfigs";
import { qc } from "../../framework/qc";
import PoolMgr from "../../manager/PoolMgr";
import ConfigMgr from "../../manager/ConfigMgr";
import PlayerMgr from "../../manager/PlayerMgr";
import adapter from "../../framework/lib/platform/adapter/adapter";
import AssetLoader from "../../framework/lib/asset/AssetLoader";
import { BundleConfigs } from "../../configs/BundleConfigs";
import { httpMgr } from "../../framework/lib/net/httpMgr";
import { PlatformConfig } from "../../framework/lib/platform/configs/PlatformConfig";
import CustomSprite from "../componetUtils/CustomSprite";
const { ccclass, property } = _decorator;

/**
 * 启动页面板
 *
 */
@ccclass
// export default class BootPanel extends PanelComponent {
export default class BootPanel extends Component {
    @property(ProgressBar)
    loadingProgressBar: ProgressBar = null;
    @property(CustomSprite)
    ageTip: CustomSprite = null;

    show(option: PanelShowOption): void {
        option.onShowed();
        this._init();
    }

    protected onEnable(): void {
        if (adapter.inst.onWx() || adapter.inst.onTt()) {
            this.ageTip.index = 1;
        }
        else {
            this.ageTip.index = 0;
        }
    }

    protected start(): void {
        this._init();
    }

    hide(option: PanelHideOption): void {
        option.onHided();
    }

    private async _init() {
        // 登录平台//
        qc.platform.login(async () => {
            await PlayerMgr.ins.getHomeData();
            PlayerMgr.ins.getEnergy();
        });
        qc.platform.reportScene(301);
        qc.platform.getShareInfo(() => {
            httpMgr.ins.xhrRequest('/Public/xcxct', 'GET', { scene: '0', path: '', adzone_id: PlatformConfig.ins.config.adzoneId });
        });
        this._initGame();
    }

    private async _initGame() {
        qc.platform.reportScene(302);
        this._onLoadProgressChanged(0.3, "加载游戏资源...");
        await AssetLoader.loadBundle(BundleConfigs.configBundle);
        await AssetLoader.loadBundle(BundleConfigs.commonBundle);
        await AssetLoader.loadBundle(BundleConfigs.audioBundle);

        // await AssetLoader.loadBundle(BundleConfigs.gameBundle);
        await AssetLoader.loadBundle(BundleConfigs.mainBundle);
        await AssetLoader.loadBundle(BundleConfigs.iconBundle);

        this._onLoadProgressChanged(0.5, "加载游戏资源...");
        await AssetLoader.loadBundle(BundleConfigs.loadingBundle);
        // await AssetLoader.loadBundle(BundleConfigs.userInfoBundle);
        // await AssetLoader.loadBundle(BundleConfigs.chengjiuBundle);
        // await AssetLoader.loadBundle(BundleConfigs.redEnvelopeBundle);
        await AssetLoader.loadBundle(BundleConfigs.exchangeBundle);
        await AssetLoader.loadBundle(BundleConfigs.taskBundle);
        await AssetLoader.loadBundle(BundleConfigs.redEnvelopeModelBundle);
        await AssetLoader.loadBundle(BundleConfigs.gameStartBundle);
        // await AssetLoader.loadBundle(BundleConfigs.luckyTurntableBundle);
        await AssetLoader.loadBundle(BundleConfigs.getItemBundle);
        await AssetLoader.loadBundle(BundleConfigs.sideRewardBundle);
        // await AssetLoader.loadBundle(BundleConfigs.cashBundle);
        // await AssetLoader.loadBundle(BundleConfigs.bgztBundle);
        this._onLoadProgressChanged(0.6, "加载游戏资源...");
        await ConfigMgr.ins.loadConfigs();
        this._onLoadProgressChanged(0.7, "加载游戏资源...");
        await qc.panelRouter.loadAsync(PanelConfigs.mainPanel);
        this._onLoadProgressChanged(.8, "加载游戏资源...");
        // await qc.panelRouter.loadAsync(PanelConfigs.gamePanel);
        this._onLoadProgressChanged(.9, "加载游戏资源...");
        await PoolMgr.ins.preloadPool();

        qc.platform.reportScene(303);
        // 打开主界面
        this._onLoadProgressChanged(1.0);
        this.scheduleOnce(() => {
            qc.panelRouter.show({
                panel: PanelConfigs.mainPanel,
                onShowed: () => {
                    // 主界面打开完毕之后，隐藏并清理启动页面板相关资源（因为后续不会在用到）
                    // qc.panelRouter.hide({
                    //     panel: PanelConfigs.bootPanel,
                    //     onHided: () => {
                    //         qc.panelRouter.destroy({
                    //             panel: PanelConfigs.bootPanel,
                    //         });
                    //     },
                    // });
                    qc.panelRouter.rootNode.getChildByName('BootPanel').destroy();
                },
            });
        }, .3);
    }

    /**
     * 加载进度更新
     *
     * @param pb 加载进度 [0, 1]
     * @param msg 加载描述信息
     */
    private _onLoadProgressChanged(pb: number, msg: string = null) {
        this.loadingProgressBar.progress = pb;
    }
}
