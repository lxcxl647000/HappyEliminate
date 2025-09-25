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
    },
    /**
     * 主界面
     */
    mainPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.mainBundle}/prefabs/MainPanel`,
        layerZIndex: PanelLayerEnum.UILayer,
    },

    /**
     * 游戏界面
     */
    gamePanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.gameBundle}/prefabs/panel/GamePanel`,
        layerZIndex: PanelLayerEnum.UILayer,
    },

    // ///////////////////////////////////////////////////////
    // 弹窗层级

    testPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.mainBundle}/prefabs/TestPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
    },
    userInfoPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.userInfoBundle}/prefabs/userInfoPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
    },
    signPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.signBundle}/prefabs/SignPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
    },
    chengjiuPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.chengjiuBundle}/prefabs/chengjiuPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
    },
    redEnvelopePanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.redEnvelopeBundle}/prefabs/redEnvelopePanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
    },
    backpackPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.backpackBundle}/prefabs/BackpackPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
    },
    exchangePanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.exchangeBundle}/prefabs/ExchangePanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
    },
    taskPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.taskBundle}/prefabs/TaskPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
    }
    ,
    redEnvelopeModelPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.redEnvelopeModelBundle}/prefabs/redEnvelopeModelPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
    }
};
