export enum ItemType {
    Gold = 1,
    Energy = 2,
    Boom = 3,
    Sort = 4,
    Hammer = 5,
    Steps = 6
}

export class ItemConfig {
    id: number;
    name: string;
    icon: string;
    big_icon: string;
    des: string;
}