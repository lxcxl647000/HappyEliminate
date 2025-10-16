export enum ItemType {
    RedPack = -1,// 红包//
    Gold = 1,
    Hammer = 2,
    Energy = 3,
    Boom = 4,
    Theme_Clips = 5,// 主题碎片//
    Steps = 6,
    Sort = 7,
    Avatar = 9,// 头像//
}

export class ItemConfig {
    id: number;
    name: string;
    icon: string;
    big_icon: string;
    des: string;
}