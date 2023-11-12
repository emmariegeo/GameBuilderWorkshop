/** @type {import("../typings/phaser")} */
import * as Phaser from 'phaser';
import { store, entityLoaded, entityById, entityAdded } from '../../../store';
import { data as assets } from '../../../data/assets.ts';
import { Entity, EntityType } from '@/data/types.ts';
import { Dictionary } from '@reduxjs/toolkit';

export default class Play extends Phaser.Scene {
    bg!: Phaser.GameObjects.Image;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    platforms!: Phaser.Physics.Arcade.StaticGroup;
    background: any;
    selectedGraphics!: Phaser.GameObjects.Graphics;
    gameEntities!: Dictionary<Entity>;
    gameEntityIDs!: Array<string>;
    mode: any;
    gameObjects!: Map<string, Phaser.GameObjects.GameObject>;
    constructor() {
        super({ key: 'Play' });
    }

    init() {
        this.background = assets['backgrounds']['bg1'];
        this.gameEntityIDs = [];
        this.gameObjects = new Map();
        this.gameEntities = {};
    }

    preload() {
        this.load.image('bg', this.background['img']);
        this.load.image('ground', '../assets/platform.png');
        this.load.spritesheet('player', 'assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        console.log("Running Play", this)
        // Subscribing to store so we can handle updates
        store.subscribe(this.onStoreChange.bind(this));
        // Getting the initial state from the store
        let initialState = store.getState();
        this.mode = initialState.canvas.mode;
        this.background = initialState.canvas.background;

        // Input Events
        this.cursors = this.input.keyboard.createCursorKeys();

        this.gameEntities = initialState.entities.entities;

        this.bg = this.add.image(this.scale.width / 4, this.scale.height / 4, 'bg');
        // We want to create a game object for each entry in gameEntities
        Object.entries(this.gameEntities)
            .forEach(([, entity]) => {
                if (entity) {
                    // If object has been created, reload it
                    if (this.gameObjects.has(entity.id)) {
                        this.loadGameObject(entity);
                        console.log('Already created, loading', entity);
                    } else {
                        // If object has not been created in scene, create it.
                        this.createGameObject(entity);
                        this.loadGameObject(entity);
                        console.log('Created and loaded', entity);
                    }
                }
            });
        // The platforms group contains the ground and the 2 ledges we can jump on
        this.platforms = this.physics.add.staticGroup();
        // Here we create the ground.
        // Scale it to fit the width of the game (the original sprite is 400x32 in size)
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        // Now let's create some ledges
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');

        this.scale.on('resize', this.resize, this);
        if (this.gameObjects.has('player')) {
            this.gameObjects.get('player').setInteractive();
            this.gameObjects.get('player').setCollideWorldBounds(true);
            // Collide the player and the stars with the platforms
            this.physics.add.collider(this.gameObjects.get('player'), this.platforms);
            this.setAnimations('player');
        }
    }

    // Set the canvas mode 
    setMode(newMode: string) {
        if (newMode == 'edit') {
            this.scene.start('Edit');
        } else {
            this.mode = 'play';
        }
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
            loader.image(newBackground, assets['backgrounds'][newBackground]['img']);
            loader.once(Phaser.Loader.Events.COMPLETE, () => {
                // texture loaded, so replace
                this.bg.setTexture(newBackground)
            });
            loader.start();
        }
    }

    // ---- START METHODS FOR INTERACTING WITH STORE ----

    // When changes are made to the store, update game
    onStoreChange() {
        if (this.scene.isActive()) {
            const state = store.getState();
            if (state.canvas.mode !== this.mode) {
                this.setMode(state.canvas.mode)
            }
        }
    }
    // Load a given game object
    loadGameObject(object: Entity) {
        if (object.type == EntityType.Player) {
            // We only will have one player, so we will swap the sprite texture
            // We check if the texture has been previously loaded
            if (
                this.gameObjects.has('player') &&
                this.gameObjects.get('player').texture.key !== object.spriteUrl
            ) {
                if (this.textures.exists(object.id)) {
                    this.gameObjects.get('player').setTexture(object.spriteUrl);
                    this.gameObjects
                        .get('player')
                        .setBodySize(object.width, object.height, true);
                } else {
                    // We wait to switch the player sprite texture
                    let loader = new Phaser.Loader.LoaderPlugin(this);
                    loader.spritesheet(object.spriteUrl, object.spriteUrl, {
                        frameWidth: object.width,
                        frameHeight: object.height,
                    });
                    loader.once(Phaser.Loader.Events.COMPLETE, () => {
                        // texture loaded, so replace
                        this.gameObjects.get('player').setTexture(object.spriteUrl);
                        this.gameObjects
                            .get('player')
                            .setBodySize(object.width, object.height, true);
                        this.setAnimations(object.id);
                    });
                    loader.start();
                }
                this.gameObjects.get('player').setData('id', object.id);
            }
        }
    }

    // ---- END METHODS FOR INTERACTING WITH STORE ----

    // Display a given game object
    createGameObject(object: Entity) {
        if (object.type == EntityType.Player) {
            this.gameObjects.set(
                'player',
                this.physics.add.sprite(object.x, object.y, 'player')
            );
            this.loadGameObject(object);
            // Player physics properties
            if (this.gameObjects.has('player')) {
                this.gameObjects.get('player').setInteractive();
                this.gameObjects.get('player').setCollideWorldBounds(true);
                this.gameObjects.get('player').setData('id', 'player');
                this.gameObjects.get('player').setCollideWorldBounds(true);
                this.gameObjects.get('player').setBounce(0.2);
            }
        }
    }

    setAnimations(key: string) {
        // Player Animations
        this.anims.remove('left');
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.remove('turn');
        this.anims.create({
            key: 'turn',
            frames: [{ key: key, frame: 4 }],
            frameRate: 20
        });
        this.anims.remove('right');
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers(key, { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
    }

    // Canvas resize
    resize(gameSize: { width: any; height: any; }, baseSize: any, displaySize: any, resolution: any) {
        const width = gameSize.width;
        const height = gameSize.height;

        this.cameras.resize(width, height);
    }

    update() {
        // Player movement with arrow controls
        if (this.gameObjects.has('player')) {
            if (this.cursors.left.isDown) {
                this.gameObjects.get('player').setVelocityX(-160);
                this.gameObjects.get('player').anims.play('left', true);
            }
            else if (this.cursors.right.isDown) {
                this.gameObjects.get('player').setVelocityX(160);
                this.gameObjects.get('player').anims.play('right', true);
            }
            else {
                this.gameObjects.get('player').setVelocityX(0);
                this.gameObjects.get('player').anims.play('turn');
            }
            if (this.cursors.up.isDown && this.gameObjects.get('player').body.touching.down) {
                this.gameObjects.get('player').setVelocityY(-830);
            }
        }
    }
}

