/** @type {import("../typings/phaser")} */
import * as Phaser from 'phaser';
import { entityAdded, entityDeleted, allEntities, store, entityLoaded, select, entityUpdated } from '../../../store';
import { data as assets } from '../../../data/assets.ts';
import { Entity, EntityType } from '@/data/types.ts';
import { Dictionary } from '@reduxjs/toolkit';

let PLAYER_X = 100;
let PLAYER_Y = 450;

let playerSample: Entity = { id: 'player', x: 100, y: 450, z: 1, width: 32, height: 32, scale: 1, orientation: 0, spriteUrl: '../assets/sprites/pinkman.png', physics: 'arcade', type: EntityType.Player, loaded: false }

export default class Edit extends Phaser.Scene {
    bg!: Phaser.GameObjects.Image;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    platforms!: Phaser.Physics.Arcade.StaticGroup;
    background: any;
    selectedGraphics!: Phaser.GameObjects.Graphics;
    gameEntities!: Dictionary<Entity>;
    gameEntityIDs: Array<string>
    playerEntity: any;
    selected: Phaser.GameObjects.Image;
    mode: any;
    constructor() {
        super('Edit');
        this.background = assets['backgrounds']['bg1'];
        this.gameEntityIDs = [];
        this.gameEntities = {};
        this.playerEntity = playerSample;
        this.selected = this.player;
    }

    preload() {
        this.load.image('bg', this.background['img']);
        this.load.image('ground', '../assets/platform.png');
        this.load.spritesheet('player', 'assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        // Subscribing to store so we can handle updates
        store.subscribe(this.onStoreChange.bind(this))
        // Input Events
        this.cursors = this.input.keyboard.createCursorKeys();
        // We want to create a game object for each entry in gameEntities
        Object.entries(this.gameEntities).forEach((entry) => {
            entry[1] && this.createGameObject(entry[1]);
        });
        // The platforms group contains the ground and the 2 ledges we can jump on
        this.platforms = this.physics.add.staticGroup();
        this.bg = this.add.image(this.scale.width / 4, this.scale.height / 4, 'bg');
        // Here we create the ground.
        // Scale it to fit the width of the game (the original sprite is 400x32 in size)
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        // Now let's create some ledges
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');
        this.createGameObject(this.playerEntity);
        this.addGameObject(this.playerEntity);

        this.scale.on('resize', this.resize, this);
        this.physics.pause();
        this.player.setInteractive();
        this.player.setCollideWorldBounds(true);
        this.player.setData('id', 'player');
        // Collide the player and the stars with the platforms
        this.physics.add.collider(this.player, this.platforms);
        this.input.setDraggable(this.player);
        this.setAnimations('player');
        // Graphics
        this.selectedGraphics = this.add.graphics();
    }

    // Set the canvas mode 
    setMode(newMode: string) {
        if (newMode == 'edit') {
            this.mode = newMode;
            // Pause physics for editing
            this.physics.pause();
            this.player.setInteractive();
            // TODO: Generalize to loop through game objects
            this.platforms.getChildren().forEach((child) => child.setInteractive());
            this.input.setDraggable(this.player);
            this.input.setDraggable(this.platforms.getChildren());
        } else if (newMode == 'play') {
            this.mode = newMode;
            // Resume physics to play
            this.physics.resume();
            this.player.setInteractive();
            // Clear selected graphics
            this.selectedGraphics.clear();
            // TODO: Generalize to loop through game objects
            this.platforms.getChildren().forEach((child) => child.setInteractive());
            this.input.setDraggable(this.player, false);
            this.input.setDraggable(this.platforms.getChildren(), false);
        }
    }

    // Set the background
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

    // Pass in object to show the bounds on
    showBounds(object: Phaser.GameObjects.Image) {
        let bounds = object.getBounds();
        // Clear and redraw on each update
        this.selectedGraphics.clear();
        this.selectedGraphics.lineStyle(2, 0xff0000);
        this.selectedGraphics.strokeRectShape(bounds);
    }

    // ---- START METHODS FOR INTERACTING WITH STORE ----

    // When changes are made to the store, update game
    onStoreChange() {
        const state = store.getState();
        if (state.options.mode == 'edit') {
            this.setMode('edit');
        } else if (state.options.mode == 'play') {
            this.setMode('play');
        }
        if (state.options.background !== this.background) {
            this.setBackground(state.options.background.toString());
        }
        if (state.entities.entities !== this.gameEntities) {
            // We only want to load entities that are unloaded
            Object.entries(state.entities.entities).filter(([, entity]) => {
                if (entity) return !entity.loaded
            }).forEach(([, entity]) => {
                if (entity) this.loadGameObject(entity);
            });
        }
    }

    // Add a game object to store given an Entity
    addGameObject(object: Entity) {
        store.dispatch(entityAdded(object));
    }

    // Update game object entity in store
    updateGameObject(object: Entity) {
        store.dispatch(entityUpdated(
            {
                id: object.id,
                changes: {
                    x: object.x,
                    y: object.y,
                    z: object.z,
                    width: object.width,
                    height: object.height,
                    scale: object.scale,
                    orientation: object.orientation,
                    spriteUrl: object.spriteUrl,
                    physics: object.physics,
                    type: object.type,
                    loaded: false
                }
            }))
    }

    // Load a given game object
    loadGameObject(object: Entity) {
        if (object.type == EntityType.Player) {
            // We only will have one player, so we will swap the sprite texture
            // We check if the texture has been previously loaded
            if (this.textures.exists(object.id)) {
                this.player.setTexture(object.id);
                this.player.setBodySize(object.width, object.height, true)
            } else {
                // We wait to switch the player sprite texture
                let loader = new Phaser.Loader.LoaderPlugin(this);
                loader.spritesheet(object.id, object.spriteUrl, { frameWidth: object.width, frameHeight: object.height });
                loader.once(Phaser.Loader.Events.COMPLETE, () => {
                    // texture loaded, so replace
                    this.player.setTexture(object.id);
                    this.player.setBodySize(object.width, object.height, true)
                    // We set the entity's "loaded" property to true
                    this.setAnimations(object.id)
                    entityLoaded(object);
                });
                loader.start();
            }
            this.player.setData('id',object.id);
        }
    }

    // Select a game object and highlight, make interactive
    selectObject(object: Phaser.GameObjects.Image) {
        if (object.getData('id')) {
            store.dispatch(select(object.getData('id')));
        }
    }

    // ---- END METHODS FOR INTERACTING WITH STORE ----

    // Display a given game object
    createGameObject(object: Entity) {
        if (object.type == EntityType.Player) {
            this.player = this.physics.add.sprite(object.x, object.y, 'player');
            // Player physics properties
            this.player.setCollideWorldBounds(true);
            this.player.setBounce(0.2);
            this.player.setData('id', object.id)
        }
        this.updateGameObject(object);
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

        this.player.setSize(width / 4, height / 4);
    }

    update() {
        // Drag objects in edit mode
        this.input.on('drag', (pointer: any, gameObject: { x: any; y: any; }, dragX: number, dragY: number) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
            this.platforms.refresh()
        });

        // Player movement with arrow controls
        if (this.mode !== 'edit') {
            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-160);
                this.player.anims.play('left', true);
            }
            else if (this.cursors.right.isDown) {
                this.player.setVelocityX(160);
                this.player.anims.play('right', true);
            }
            else {
                this.player.setVelocityX(0);
                this.player.anims.play('turn');
            }
            if (this.cursors.up.isDown && this.player.body.touching.down) {
                this.player.setVelocityY(-830);
            }
        } else {
            // Select game object on click
            this.input.on('gameobjectdown', (pointer: any, gameObject: Phaser.GameObjects.Image) => {
                this.selected = gameObject;
                this.selectObject(gameObject)
            });
            this.selected && this.showBounds(this.selected);
        }
    }
}

