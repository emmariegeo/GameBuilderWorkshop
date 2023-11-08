export enum EntityType {
    Player = "PLAYER",
    Enemy = "ENEMY",
    Obstacle = "OBSTACLE",
    Item = "ITEM"
}

/**
 * Entity class is used to manage game object data
 */
export type Entity = {
    id: string;
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    scale: number;
    orientation: number;
    spriteUrl: string;
    physics: string;
    type: EntityType;
    loaded: boolean;
}

/**
 * Game Building tools
 */
export enum Tool {
    Select = "SELECT",
    Delete = "DELETE",
    Fill = "FILL",
    Resize = "RESIZE",
    Rotate = "ROTATE",
    Flip = "FLIP",
    Duplicate = "DUPLICATE"
}