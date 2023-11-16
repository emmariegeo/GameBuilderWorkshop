/** @type {import("../typings/phaser")} */
import * as Phaser from "phaser";
import { data as assets } from "../../../data/assets.ts";
import { Dictionary } from "@reduxjs/toolkit";
import { Entity, EntityType } from "@/data/types.ts";

// Provides methods shared between Edit and Play Scenes
export default class BaseScene extends Phaser.Scene {
    gameEntities!: Dictionary<Entity>;
    background: any;
    gameEntityIDs!: Array<string>;
    gameObjects!: Map<string, Phaser.GameObjects.GameObject>;
    bg: any;

    constructor(key: string) {
        super({ key: key });
        this.gameEntities = {};
    }

    init() {
        this.background = assets['backgrounds']['bg1'];
        this.gameEntityIDs = [];
        this.gameObjects = new Map();
        this.gameEntities = {};
    }

    preload() {
        this.load.image('bg', this.background['img']);
        this.load.image('ground', '../assets/platforms/platform.png');
    }

    /**
    * Return game object cast to respective type
    */
    getSpriteObject(key: string) {
        let object = this.gameObjects.get(key);
        
        return object as Phaser.Physics.Arcade.Sprite;
    }

    getGameObject(key: string) {
        let object = this.gameObjects.get(key);
        return object;
    }

    /**
    * Set the new background
    * @param newBackground string referring to background asset ket
    */
    setBackground(newBackground: string) {
        // Confirm that background exists in assets
        if (newBackground in assets["backgrounds"]) {
            this.background = newBackground;
            // We wait to set the background image to the new texture until the image has been loaded in.
            let loader = new Phaser.Loader.LoaderPlugin(this);
            loader.image(newBackground, assets["backgrounds"][newBackground]["img"]);
            loader.once(Phaser.Loader.Events.COMPLETE, () => {
                // texture loaded, so replace
                this.bg.setTexture(newBackground);
            });
            loader.start();
        }
    }
}