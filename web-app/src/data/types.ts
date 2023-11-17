export enum EntityType {
    Player = "PLAYER",
    Enemy = "ENEMY",
    Obstacle = "OBSTACLE",
    Item = "ITEM",
    Platform = "PLATFORM",
}

/**
 * Entity type is used to manage game object data
 */
export type Entity = {
    id: string;
    x: number;
    y: number;
    z: number;
    title: string;
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
    scale: number;
    orientation: number;
    spriteUrl: string;
    physics: string;
    type: EntityType;
    loaded: boolean;
}

/**
 * EntityGroup
 */
export type EntityGroup = {
    id: string;
    entityIds: string[];
    physics: string;
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