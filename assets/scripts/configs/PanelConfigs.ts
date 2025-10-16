import { PanelConfig } from "../framework/lib/router/PanelConfig";
import { BundleConfigs } from "./BundleConfigs";

/**
 * 面板图层层级（层级大的显示在最前面）
 */
enum PanelLayerEnum {
    /**
     * 普通界面
     */
    UILayer = 200,

    /**
     * 弹窗层级
     */
    PopLayer = 400,
    /**
     * 弹窗层级
     */
    PopLayer1 = 401,
}

/**
 * 游戏面板配置
 */
export const PanelConfigs = {
    // ///////////////////////////////////////////////////////
    // 普通页面层级

    /**
     * 游戏启动页面板
     */
    bootPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.bootBundle}/prefabs/BootPanel`,
        layerZIndex: PanelLayerEnum.UILayer,
        index: 0,
    },
    /**
     * 主界面
     */
    mainPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.mainBundle}/prefabs/MainPanel`,
        layerZIndex: PanelLayerEnum.UILayer,
        index: 0,
    },

    /**
     * 游戏界面
     */
    gamePanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.gameBundle}/prefabs/panel/GamePanel`,
        layerZIndex: PanelLayerEnum.UILayer,
        index: 0,
    },

    // ///////////////////////////////////////////////////////
    // 弹窗层级

    testPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.mainBundle}/prefabs/TestPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
        index: 1,
    },
    userInfoPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.userInfoBundle}/prefabs/userInfoPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
        index: 1,
    },
    signPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.signBundle}/prefabs/SignPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
        index: 1,
    },
    chengjiuPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.chengjiuBundle}/prefabs/chengjiuPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
        index: 1,
    },
    redEnvelopePanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.redEnvelopeBundle}/prefabs/redEnvelopePanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
        index: 1,
    },
    backpackPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.backpackBundle}/prefabs/BackpackPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
        index: 1,
    },
    exchangePanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.exchangeBundle}/prefabs/ExchangePanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
        index: 1,
    },
    taskPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.taskBundle}/prefabs/TaskPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
        index: 1,
    }
    ,
    redEnvelopeModelPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.redEnvelopeModelBundle}/prefabs/redEnvelopeModelPanel`,
        layerZIndex: PanelLayerEnum.PopLayer1,
        index: 2,
    }
    ,
    gameStartPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.gameStartBundle}/prefabs/GameStartPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
        index: 1,
    }
    ,
    addGoldPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.addGoldBundle}/prefabs/AddGoldPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
        index: 1,
    }
    ,
    luckyTurntablePanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.luckyTurntableBundle}/prefabs/LuckyTurntablePanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
        index: 1,
    }
    ,
    gmPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.gmBundle}/prefabs/GMPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
        index: 1,
    }
    ,
    getItemPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.getItemBundle}/prefabs/GetItemPanel`,
        layerZIndex: PanelLayerEnum.PopLayer1,
        index: 2,
    }
    ,
    cashPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.cashBundle}/prefabs/CashPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
        index: 1,
    }
    ,
    gameExitPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.gameBundle}/prefabs/panel/GameExitPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
        index: 1,
    }
};
