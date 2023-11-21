/** @type {import("../typings/phaser")} */
import * as Phaser from 'phaser';
import { store } from '../../../store';
import { data as assets } from '../../../data/assets.ts';
import { Entity } from '@/data/types.ts';
import { Dictionary } from '@reduxjs/toolkit';
import BaseScene from './BaseScene.ts';
import { it } from 'node:test';

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
  gameOver!: boolean;
  score!: number;
  scoreText: any;
  items!: Phaser.Physics.Arcade.Group;
  obstacles!: Phaser.Physics.Arcade.Group;
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
    console.log('RUNNING PLAY MODE', this);
    // Subscribing to store so we can handle updates
    store.subscribe(this.onStoreChange.bind(this));
    // Getting the initial state from the store
    this.gameOver = false;
    this.score = 0;
    let initialState = store.getState();
    this.mode = initialState.canvas.mode;
    this.background = initialState.canvas.background;

    // Input Events
    this.cursors = this.input.keyboard?.createCursorKeys();

    // Making shallow copy of entities dictionary from the store
    this.gameEntities = { ...initialState.entities.entities };

    this.bg = this.add.image(this.scale.width / 4, this.scale.height / 4, 'bg');
    this.setBackground(this.background);

    // The platforms group contains objects the player can jump on/collide with
    this.platforms = this.physics.add.staticGroup();
    // The items group contains objects the player can collect
    this.items = this.physics.add.group();
    // The obstacles group contains objects the player can hit
    this.obstacles = this.physics.add.group();

    this.scale.on('resize', this.resize, this);

    // We want to create a game object for each entry in gameEntities and add it to the appropriate group
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

  // this.loadGameObject method is inherited from BaseScene

  /**
   * Load the player object
   * @param object Entity
   */
  loadPlayer(object: Entity) {
    // We only will have one player, so we will swap the sprite texture
    let player = this.gameObjects.get('player') as Phaser.Physics.Arcade.Sprite;
    // We check if the texture has been previously loaded
    if (this.textures.exists(`PLAY_${object.title}`)) {
      if (this.gameObjects.has('player')) {
        player
          .setTexture(`PLAY_${object.title}`)
          .setScale(object.scaleX, object.scaleY);
      } else {
        this.gameObjects.set(
          'player',
          this.physics.add.sprite(object.x, object.y, `PLAY_${object.title}`)
        );

        player = this.gameObjects.get('player') as Phaser.Physics.Arcade.Sprite;
        player
          .setInteractive()
          .setCollideWorldBounds(true)
          .setBounce(0.2)
          .setScale(object.scaleX, object.scaleY)
          .setData('id', 'player');
        this.physics.add.collider(player, this.platforms);
        // Checks to see if the player overlaps with any of the items, if player does, call the collectItem function
        this.physics.add.overlap(
          player,
          this.items,
          this.collectItem,
          undefined,
          this
        );
        // Checks to see if the player overlaps with any of the obstacles, if player does, call the collectobstacles function
        this.physics.add.collider(
          player,
          this.obstacles,
          this.hitObstacle,
          undefined,
          this
        );
      }
      player.refreshBody();
      this.setAnimations(object.title);
    } else {
      // We wait to switch the player sprite texture
      let loader = new Phaser.Loader.LoaderPlugin(this);
      loader.spritesheet(`PLAY_${object.title}`, object.spriteUrl, {
        frameWidth: object.spriteWidth,
        frameHeight: object.spriteHeight,
      });
      loader.once(Phaser.Loader.Events.COMPLETE, () => {
        // texture loaded, so replace
        if (this.gameObjects.has('player')) {
          player
            .setTexture(`PLAY_${object.title}`)
            .setScale(object.scaleX, object.scaleY);
        } else {
          this.gameObjects.set(
            'player',
            this.physics.add.sprite(object.x, object.y, `PLAY_${object.title}`)
          );
          player = this.gameObjects.get(
            'player'
          ) as Phaser.Physics.Arcade.Sprite;
          player
            .setInteractive()
            .setCollideWorldBounds(true)
            .setBounce(0.2)
            .setScale(object.scaleX, object.scaleY)
            .setData('id', 'player');

          this.physics.add.collider(player, this.platforms);
          // Checks to see if the player overlaps with any of the items, if player does, call the collectItem function
          this.physics.add.overlap(
            player,
            this.items,
            this.collectItem,
            undefined,
            this
          );
          // Checks to see if the player overlaps with any of the obstacles, if player does, call the collectobstacles function
          this.physics.add.collider(
            player,
            this.obstacles,
            this.hitObstacle,
            undefined,
            this
          );
        }
        this.setAnimations(object.title);
        player.refreshBody();
      });
      loader.start();
    }
  }

  /**
   * Load a platform object
   * @param object Entity
   */
  loadPlatform(object: Entity) {
    let platform = this.getGameObject(
      object.id
    ) as Phaser.Physics.Arcade.Sprite;
    // If the correct texture exists, update the object texture
    if (this.textures.exists(`PLAY_${object.title}`)) {
      if (this.gameObjects.has(object.id)) {
        this.platforms.remove(platform, true);
        platform
          .setTexture(`PLAY_${object.title}`)
          .setScale(object.scaleX, object.scaleY);
      } else {
      }
      platform.setData('id', object.id);
      this.platforms.add(platform);
      this.platforms.refresh();
    } else {
      // If not, we wait to switch the object texture
      let loader = new Phaser.Loader.LoaderPlugin(this);
      loader.image(`PLAY_${object.title}`, object.spriteUrl);
      loader.once(Phaser.Loader.Events.COMPLETE, () => {
        // Set texture on existing platform
        if (this.gameObjects.has(object.id)) {
          this.platforms.remove(platform, true);
          platform
            .setTexture(`PLAY_${object.title}`)
            .setScale(object.scaleX, object.scaleY);
        } else {
          // Set texture on new platform
          this.gameObjects.set(
            object.id,
            this.physics.add
              .staticImage(object.x, object.y, `PLAY_${object.title}`)
              .setScale(object.scaleX, object.scaleY)
          );
          platform = this.getGameObject(
            object.id
          ) as Phaser.Physics.Arcade.Sprite;
        }
        platform.setData('id', object.id);
        this.platforms.add(platform);
        this.platforms.refresh();
      });
      loader.start();
    }
  }

  /**
   * Load item
   * @param object Entity
   * @returns
   */
  loadItem(object: Entity) {
    let item = this.getGameObject(object.id) as Phaser.Physics.Arcade.Sprite;
    // If texture exists, apply
    if (this.textures.exists(`PLAY_${object.title}`)) {
      if (
        this.gameObjects.has(object.id) &&
        item.texture.key !== `PLAY_${object.title}`
      ) {
        this.items.remove(item, true);
        item
          .setTexture(`PLAY_${object.title}`)
          .setScale(object.scaleX, object.scaleY);
      } else if (!this.gameObjects.has(object.id)) {
        this.gameObjects.set(
          object.id,
          this.physics.add
            .staticImage(object.x, object.y, `PLAY_${object.title}`)
            .setScale(object.scaleX, object.scaleY)
        );
        item = this.getGameObject(object.id) as Phaser.Physics.Arcade.Sprite;
      }
      item.setData('id', object.id);
      this.items.add(item);
    } else {
      // If texture does not exist, load before applying
      let loader = new Phaser.Loader.LoaderPlugin(this);
      loader.image(`PLAY_${object.title}`, object.spriteUrl);
      loader.once(Phaser.Loader.Events.COMPLETE, () => {
        // texture loaded, so replace
        if (this.gameObjects.has(object.id)) {
          this.items.remove(item, true);
          item
            .setTexture(`PLAY_${object.title}`)
            .setScale(object.scaleX, object.scaleY);
        } else {
          this.gameObjects.set(
            object.id,
            this.physics.add
              .staticImage(object.x, object.y, `PLAY_${object.title}`)
              .setScale(object.scaleX, object.scaleY)
          );
          item = this.getGameObject(object.id) as Phaser.Physics.Arcade.Sprite;
        }
        item.setData('id', object.id);
        this.items.add(item);
      });
      loader.start();
    }
  }

  /**
   * Load obstacle
   * @param object Entity
   * @returns
   */
  loadObstacle(object: Entity) {
    return;
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
   * Note:
   *  collideCallback expects params to be type GameObjectWithBody | Tile.
   *  The type Tile is incompatible with Sprite, so to avoid type error, using the type any.
   * @param player any (cast to Phaser.Physics.Arcade.Sprite)
   * @param obstacle any (cast to Phaser.GameObjects.GameObject)
   */
  hitObstacle(player: any, obstacle: any) {
    obstacle = obstacle as Phaser.GameObjects.GameObject;
    player = player as Phaser.Physics.Arcade.Sprite;

    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    this.gameOver = true;
  }

  /**
   * Collect an item and apply item effects
   * Note:
   *  collideCallback expects params to be type GameObjectWithBody | Tile.
   *  The type Tile is incompatible with Sprite, so to avoid type error, using the type any.
   * @param player any (cast to Phaser.Physics.Arcade.Sprite)
   * @param item any (cast to Phaser.Physics.Arcade.Sprite)
   */
  collectItem(player: any, item: any) {
    item = item as Phaser.Physics.Arcade.Sprite;
    item.disableBody(true, true);

    //  Add and update the score
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // TODO: set up items and obstacles
    if (this.items.countActive(true) === 0) {
      //  A new batch of items to collect
      this.items.children.iterate((c) => {
        let child = c as Phaser.Physics.Arcade.Sprite;
        child.enableBody(true, child.x, 0, true, true);
        return true;
      });

      let x =
        player.x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);

      let obstacle = this.obstacles.create(x, 16, 'bomb');
      obstacle.setBounce(1);
      obstacle.setCollideWorldBounds(true);
      obstacle.setVelocity(Phaser.Math.Between(-200, 200), 20);
      obstacle.allowGravity = false;
    }
  }

  // ----- END GAME LOGIC METHODS ------
  /**
   * Run game updates
   */
  update() {
    // End game, stop updates
    if (this.gameOver) {
      return;
    }

    // Player movement with arrow controls
    if (this.gameObjects.has('player')) {
      if (this.cursors?.left.isDown) {
        (
          this.getGameObject('player') as Phaser.Physics.Arcade.Sprite
        ).setVelocityX(-160);
        (
          this.getGameObject('player') as Phaser.Physics.Arcade.Sprite
        ).anims.play(`left_${this.currentAnimKey}`, true);
      } else if (this.cursors?.right.isDown) {
        (
          this.getGameObject('player') as Phaser.Physics.Arcade.Sprite
        ).setVelocityX(160);
        (
          this.getGameObject('player') as Phaser.Physics.Arcade.Sprite
        ).anims.play(`right_${this.currentAnimKey}`, true);
      } else {
        (
          this.getGameObject('player') as Phaser.Physics.Arcade.Sprite
        ).setVelocityX(0);
        (
          this.getGameObject('player') as Phaser.Physics.Arcade.Sprite
        ).anims.play(`turn_${this.currentAnimKey}`, true);
      }
      if (
        this.cursors?.up.isDown &&
        (this.getGameObject('player') as Phaser.Physics.Arcade.Sprite).body
          ?.touching.down
      ) {
        (
          this.getGameObject('player') as Phaser.Physics.Arcade.Sprite
        )?.setVelocityY(-830);
      }
    }
  }
}
