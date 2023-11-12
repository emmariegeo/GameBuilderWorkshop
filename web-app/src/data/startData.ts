import { Entity, EntityType } from "./types";

export const playerSample: Entity = {
    id: "player",
    x: 100,
    y: 450,
    z: 1,
    width: 32,
    height: 32,
    scale: 1,
    orientation: 0,
    spriteUrl: "../assets/sprites/pinkman.png",
    physics: "arcade",
    type: EntityType.Player,
    loaded: false,
  };