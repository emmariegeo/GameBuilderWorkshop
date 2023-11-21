/** @type {import("../typings/phaser")} */
import * as Phaser from 'phaser';
import { store } from '../../../store';
import { data as assets } from '../../../data/assets.ts';
import { Entity, EntityType } from '@/data/types.ts';
import { Dictionary } from '@reduxjs/toolkit';
import BaseScene from './BaseScene.ts';

/**
 * Play scene extends the BaseScene and is used to play the game.
 */
export default class Play extends BaseScene {
  bg!: Phaser.GameObjects.Image;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  platforms!: Phaser.Physics.Arcade.StaticGroup;
  background: any;
  selectedGraphics!: Phaser.GameObjects.Graphics;
  gameEntities!: Dictionary<Entity>;
  gameEntityIDs!: Array<string>;
  mode: any;
  currentAnimKey: string | undefined;
  gameObjects!: Map<string, Phaser.GameObjects.GameObject>;
  gameOver: boolean;
  constructor() {
    super('Play');
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
  }

  create() {
    console.log(
      'RUNNING PLAY MODE',
      this,
    );
    // Subscribing to store so we can handle updates
    store.subscribe(this.onStoreChange.bind(this));
    // Getting the initial state from the store
    let initialState = store.getState();
    this.mode = initialState.canvas.mode;
    this.background = initialState.canvas.background;

    // Input Events
    this.cursors = this.input.keyboard?.createCursorKeys();

    // Making shallow copy of entities dictionary from the store
    this.gameEntities = { ...initialState.entities.entities };

    this.bg = this.add.image(this.scale.width / 4, this.scale.height / 4, 'bg');
    this.setBackground(this.background);
    // We want to create a game object for each entry in gameEntities
    // The platforms group contains the ground and the 2 ledges we can jump on
    this.platforms = this.physics.add.staticGroup();
    this.scale.on('resize', this.resize, this);
    Object.entries(this.gameEntities).forEach((entry) => {
      entry[1] && !entry[1].loaded && this.loadGameObject(entry[1]);
    });
  }

  // ---- START METHODS FOR INTERACTING WITH STORE ----

  // When changes are made to the store, update game
  onStoreChange() {
    if (this.scene.isActive()) {
      const state = store.getState();
      if (state.canvas.modeSwitch === 'pending') {
        this.setMode(state.canvas.mode);
      }
      if (state.entities.entities !== this.gameEntities) {
        // We only want to load entities that are unloaded
        Object.entries(state.entities.entities)
          .filter(([, entity]) => {
            if (entity) return !entity.loaded;
          })
          .forEach(([, entity]) => {
            if (entity) {
              this.loadGameObject(entity);

              // Set entity id and value in gameEntities, used to track changes with entities in store.
              this.gameEntities[entity.id] = entity;
            }
          });
      }
    }
  }

  // ---- END METHODS FOR INTERACTING WITH STORE ----

  // Load a given game object
  loadGameObject(object: Entity) {
    switch (object.type) {
      case EntityType.Player:
        // We only will have one player, so we will swap the sprite texture
        // We check if the texture has been previously loaded
        if (
          this.gameObjects.has('player') &&
          this.getSpriteObject('player')?.texture.key !== `PLAY_${object.title}`
        ) {
          if (this.textures.exists(`PLAY_${object.title}`)) {
            this.gameObjects.get('player')?.setData('id', 'player');
            this.getSpriteObject('player')
              ?.setTexture(`PLAY_${object.title}`)
              .setScale(object.scaleX, object.scaleY);
            this.setAnimations(object.title);
            this.getSpriteObject('player')?.refreshBody();
          } else {
            // We wait to switch the player sprite texture
            let loader = new Phaser.Loader.LoaderPlugin(this);
            loader.spritesheet(`PLAY_${object.title}`, object.spriteUrl, {
              frameWidth: object.spriteWidth,
              frameHeight: object.spriteHeight,
            });
            loader.once(Phaser.Loader.Events.COMPLETE, () => {
              // texture loaded, so replace
              this.gameObjects.get('player')?.setData('id', 'player');
              this.getSpriteObject('player')
                ?.setTexture(`PLAY_${object.title}`)
                .setScale(object.scaleX, object.scaleY);
              this.setAnimations(object.title);
              this.getSpriteObject('player')?.refreshBody();
            });
            loader.start();
          }
        } else if (!this.gameObjects.has('player')) {
          if (this.textures.exists(`PLAY_${object.title}`)) {
            this.gameObjects.set(
              'player',
              this.physics.add.sprite(
                object.x,
                object.y,
                `PLAY_${object.title}`
              )
            );
            this.setAnimations(object.title);
            this.getSpriteObject('player')?.setInteractive();
            this.getSpriteObject('player')?.setCollideWorldBounds(true);
            this.getSpriteObject('player')?.setBounce(0.2);
            this.getSpriteObject(object.id)?.setScale(
              object.scaleX,
              object.scaleY
            );
            this.getSpriteObject('player')?.refreshBody();
            let player = this.getSpriteObject('player');
            player && this.physics.add.collider(player, this.platforms);
            this.gameObjects.get('player')?.setData('id', 'player');
          } else {
            // We wait to switch the player sprite texture
            let loader = new Phaser.Loader.LoaderPlugin(this);
            loader.spritesheet(`PLAY_${object.title}`, object.spriteUrl, {
              frameWidth: object.spriteWidth,
              frameHeight: object.spriteHeight,
            });
            loader.once(Phaser.Loader.Events.COMPLETE, () => {
              this.gameObjects.set(
                'player',
                this.physics.add.sprite(
                  object.x,
                  object.y,
                  `PLAY_${object.title}`
                )
              );
              this.gameObjects.get('player')?.setData('id', 'player');
              this.getSpriteObject('player')?.setInteractive();
              this.getSpriteObject('player')?.setCollideWorldBounds(true);
              this.getSpriteObject('player')?.setBounce(0.2);
              let player = this.getSpriteObject('player');
              this.getSpriteObject(object.id)?.setScale(
                object.scaleX,
                object.scaleY
              );
              this.setAnimations(object.title);
              this.getSpriteObject('player')?.refreshBody();
              player && this.physics.add.collider(player, this.platforms);
            });
            loader.start();
          }
        }
        break;
      case EntityType.Platform:
        // Game Object exists but has the incorrect texture
        if (
          this.gameObjects.has(object.id) &&
          this.getSpriteObject(object.id)?.texture.key !==
            `PLAY_${object.title}`
        ) {
          // If the correct texture exists, update the object texture
          if (this.textures.exists(`PLAY_${object.title}`)) {
            let platform = this.getGameObject(object.id);
            platform && this.platforms.remove(platform, true);
            this.getSpriteObject(object.id)
              ?.setTexture(`PLAY_${object.title}`)
              .setScale(object.scaleX, object.scaleY);
            this.getGameObject(object.id)?.setData('id', object.id);
            platform = this.getGameObject(object.id);
            platform && this.platforms.add(platform);
            this.platforms.refresh();
          } else {
            // If not, we wait to switch the object texture
            let loader = new Phaser.Loader.LoaderPlugin(this);
            loader.image(`PLAY_${object.title}`, object.spriteUrl);
            loader.once(Phaser.Loader.Events.COMPLETE, () => {
              // texture loaded, so replace
              let platform = this.getGameObject(object.id);
              platform && this.platforms.remove(platform, true);
              this.getSpriteObject(object.id)
                ?.setTexture(`PLAY_${object.title}`)
                .setScale(object.scaleX, object.scaleY);
              this.getGameObject(object.id)?.setData('id', object.id);
              platform = this.getGameObject(object.id);
              platform && this.platforms.add(platform);
              this.platforms.refresh();
            });
            loader.start();
          }
          // Game Object does not exist
        } else if (!this.gameObjects.has(object.id)) {
          if (this.textures.exists(`PLAY_${object.title}`)) {
            this.gameObjects.set(
              object.id,
              this.physics.add
                .staticImage(object.x, object.y, `PLAY_${object.title}`)
                .setScale(object.scaleX, object.scaleY)
            );
            this.getGameObject(object.id)?.setData('id', object.id);
            let platform = this.getGameObject(object.id);
            platform && this.platforms.add(platform);
            this.platforms.refresh();
          } else {
            // We wait to switch the platform texture
            let loader = new Phaser.Loader.LoaderPlugin(this);
            loader.image(`PLAY_${object.title}`, object.spriteUrl);
            loader.once(Phaser.Loader.Events.COMPLETE, () => {
              // texture loaded, so replace
              this.gameObjects.set(
                object.id,
                this.physics.add
                  .staticImage(object.x, object.y, `PLAY_${object.title}`)
                  .setScale(object.scaleX, object.scaleY)
              );
              this.getGameObject(object.id)?.setData('id', object.id);
              let platform = this.getGameObject(object.id);
              platform && this.platforms.add(platform);
              this.platforms.refresh();
            });
            loader.start();
          }
        }
        break;
      default:
        break;
    }
  }

  setAnimations(key: string) {
    // Player Animations
    if (!this.anims.exists(`left_${key}`)) {
      this.anims.create({
        key: `left_${key}`,
        frames: this.anims.generateFrameNumbers(`PLAY_${key}`, {
          start: 0,
          end: 3,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }
    if (!this.anims.exists(`turn_${key}`)) {
      this.anims.create({
        key: `turn_${key}`,
        frames: [{ key: `PLAY_${key}`, frame: 4 }],
        frameRate: 20,
      });
    }
    if (!this.anims.exists(`right_${key}`)) {
      this.anims.create({
        key: `right_${key}`,
        frames: this.anims.generateFrameNumbers(`PLAY_${key}`, {
          start: 5,
          end: 8,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }
    this.currentAnimKey = key;
  }

  // Canvas resize
  resize(
    gameSize: { width: any; height: any },
    baseSize: any,
    displaySize: any,
    resolution: any
  ) {
    const width = gameSize.width;
    const height = gameSize.height;

    this.cameras.resize(width, height);
  }

  // ----- BEGIN GAME LOGIC METHODS ------

  /**
   * Hitting an obstacle ends the game.
   * @param player Phaser.Physics.Arcade.Sprite
   * @param obstacle Phaser.GameObjects.GameObject
   */
  hitObstacle (player: Phaser.Physics.Arcade.Sprite, obstacle: Phaser.GameObjects.GameObject)
  {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    this.gameOver = true;
  }

  // ----- END GAME LOGIC METHODS ------
  /**
   * Run game updates
   */
  update() {
    // Player movement with arrow controls
    if (this.gameObjects.has('player')) {
      if (this.cursors?.left.isDown) {
        this.getSpriteObject('player')?.setVelocityX(-160);
        this.getSpriteObject('player')?.anims.play(
          `left_${this.currentAnimKey}`,
          true
        );
      } else if (this.cursors?.right.isDown) {
        this.getSpriteObject('player')?.setVelocityX(160);
        this.getSpriteObject('player')?.anims.play(
          `right_${this.currentAnimKey}`,
          true
        );
      } else {
        this.getSpriteObject('player')?.setVelocityX(0);
        this.getSpriteObject('player')?.anims.play(
          `turn_${this.currentAnimKey}`,
          true
        );
      }
      if (
        this.cursors?.up.isDown &&
        this.getSpriteObject('player')?.body?.touching.down
      ) {
        this.getSpriteObject('player')?.setVelocityY(-830);
      }
    }
  }
}
