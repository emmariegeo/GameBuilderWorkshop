/** @type {import("../typings/phaser")} */
import * as Phaser from 'phaser';
import { store } from '../../../store';
import { data as assets } from '../../../data/assets.ts';
import { Entity } from '@/data/types.ts';
import { Dictionary } from '@reduxjs/toolkit';
import BaseScene from './BaseScene.ts';

// Used to differentiate between moving and still game objects.
const Motion = {
  STILL: 0,
  MOVING: 1,
};

/**
 * Play scene extends the BaseScene and is used to play the game.
 */
export default class Play extends BaseScene {
  bg!: Phaser.GameObjects.Image;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  platforms!: Phaser.Physics.Arcade.StaticGroup;
  background: any;
  audio!: string;
  soundObject:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound
    | undefined;
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
  effectKey: string | undefined;
  effect: Phaser.GameObjects.Light | undefined;
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
    this.audio = initialState.canvas.audio;
    this.effectKey = initialState.canvas.effect;

    // Input Events
    this.cursors = this.input.keyboard?.createCursorKeys();

    // Making shallow copy of entities dictionary from the store
    this.gameEntities = { ...initialState.entities.entities };

    this.bg = this.add.image(this.scale.width / 2, this.scale.height / 2, 'bg');
    this.setBackground(this.background);
    this.effectKey && this.setEffect(this.effectKey);

    if (this.audio !== '' && !this.soundObject?.isPlaying) {
      this.setAudio(this.audio);
      this.soundObject?.play();
    }

    // The platforms group contains objects the player can jump on/collide with
    this.platforms = this.physics.add.staticGroup();
    // The items group contains objects the player can collect
    this.items = this.physics.add.group();
    // The obstacles group contains objects the player can hit
    this.obstacles = this.physics.add.group().setDepth(4);

    //  The score
    this.scoreText = this.add.text(16, 16, 'score: 0', {
      fontSize: '32px',
      color: '#000',
      backgroundColor: '#ffffff',
    });

    // We want to create a game object for each entry in gameEntities and add it to the appropriate group
    Object.entries(this.gameEntities).forEach((entry) => {
      entry[1] && !entry[1].loaded && this.loadGameObject(entry[1]);
    });

    this.physics.add.collider(this.items, this.platforms);
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
        if (player.texture.key === `PLAY_${object.title}`) return;
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
      let loader = this.load.spritesheet(
        `PLAY_${object.title}`,
        object.spriteUrl,
        {
          frameWidth: object.spriteWidth,
          frameHeight: object.spriteHeight,
        }
      );
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
        if (platform.texture.key === `PLAY_${object.title}`) return;
        this.platforms.remove(platform, true);
        platform
          ?.setTexture(`PLAY_${object.title}`)
          .setScale(object.scaleX, object.scaleY);
      } else {
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
      platform.setData('id', object.id).refreshBody();
      this.platforms.add(platform);
      this.platforms.refresh();
    } else {
      // If not, we wait to switch the object texture
      let loader = this.load.image(`PLAY_${object.title}`, object.spriteUrl);
      loader.once(Phaser.Loader.Events.COMPLETE, () => {
        // Set texture on existing platform
        if (this.gameObjects.has(object.id)) {
          this.platforms.remove(platform);
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
        platform.setData('id', object.id).refreshBody();
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
            .sprite(object.x, object.y, `PLAY_${object.title}`)
            .setScale(object.scaleX, object.scaleY)
        );
        item = this.getGameObject(object.id) as Phaser.Physics.Arcade.Sprite;
      }
      item.setData('id', object.id).setCollideWorldBounds(true);
      this.items.add(item);
    } else {
      // If texture does not exist, load before applying
      let loader = this.load.image(`PLAY_${object.title}`, object.spriteUrl);
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
              .sprite(object.x, object.y, `PLAY_${object.title}`)
              .setScale(object.scaleX, object.scaleY)
          );
          item = this.getGameObject(object.id) as Phaser.Physics.Arcade.Sprite;
        }
        item.setData('id', object.id).setCollideWorldBounds(true);
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
    let obstacle = this.getGameObject(
      object.id
    ) as Phaser.Physics.Arcade.Sprite;
    // If texture exists, apply
    if (this.textures.exists(`PLAY_${object.title}`)) {
      if (
        this.gameObjects.has(object.id) &&
        obstacle.texture.key !== `PLAY_${object.title}`
      ) {
        this.obstacles.remove(obstacle, true);
        obstacle
          .setTexture(`PLAY_${object.title}`)
          .setScale(object.scaleX, object.scaleY);
      } else if (!this.gameObjects.has(object.id)) {
        this.gameObjects.set(
          object.id,
          this.physics.add
            .sprite(object.x, object.y, `PLAY_${object.title}`)
            .setScale(object.scaleX, object.scaleY)
        );
        obstacle = this.getGameObject(
          object.id
        ) as Phaser.Physics.Arcade.Sprite;
      }
      obstacle.setData('id', object.id);
      this.obstacles.add(obstacle);
      switch (object.physics) {
        case 'BOUNCE':
          obstacle
            .setBounce(1)
            .setCollideWorldBounds(true)
            .setVelocity(Phaser.Math.Between(-200, 200), 20)
            .setGravity(0);
          break;
        case 'FLOAT':
          obstacle.setGravity(0).setImmovable();
          (obstacle.body as Phaser.Physics.Arcade.Body)?.setDirectControl();
          this.tweens.add({
            targets: obstacle,
            y: 600,
            duration: 3000,
            ease: 'sine.inout',
            yoyo: true,
            repeat: -1,
          });
          break;
        case 'STATIC':
          (obstacle.body as Phaser.Physics.Arcade.Body)?.setAllowGravity(false);
          break;
        default:
          break;
      }
    } else {
      // If texture does not exist, load before applying
      let loader = this.load.image(`PLAY_${object.title}`, object.spriteUrl);
      loader.once(Phaser.Loader.Events.COMPLETE, () => {
        // texture loaded, so replace
        if (this.gameObjects.has(object.id)) {
          this.obstacles.remove(obstacle, true);
          obstacle
            .setTexture(`PLAY_${object.title}`)
            .setScale(object.scaleX, object.scaleY);
        } else {
          this.gameObjects.set(
            object.id,
            this.physics.add
              .sprite(object.x, object.y, `PLAY_${object.title}`)
              .setScale(object.scaleX, object.scaleY)
          );
          obstacle = this.getGameObject(
            object.id
          ) as Phaser.Physics.Arcade.Sprite;
        }
        obstacle.setData('id', object.id);
        obstacle.setData('physics', object.physics);
        this.obstacles.add(obstacle);
        // Obstacles can have different behaviors
        switch (object.physics) {
          case 'BOUNCE': // Obstacle bounces around game canvas
            obstacle
              .setState(Motion.MOVING)
              .setBounce(1)
              .setCollideWorldBounds(true)
              .setVelocity(Phaser.Math.Between(-200, 200), 20)
              .setGravity(0);
            break;
          case 'FLOAT': // Obstacle floats up and down
            obstacle.setGravity(0).setImmovable().setState(Motion.MOVING);
            (obstacle.body as Phaser.Physics.Arcade.Body)?.setDirectControl();
            this.tweens.add({
              targets: obstacle,
              y: 600,
              duration: 3000,
              ease: 'sine.inout',
              yoyo: true,
              repeat: -1,
            });
            break;
          case 'STATIC': // Obstacle does not move
            (obstacle.body as Phaser.Physics.Arcade.Body)?.setAllowGravity(
              false
            );
            obstacle.setState(Motion.STILL);
            break;
          default:
            break;
        }
      });
      loader.start();
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
    player.anims.play(`turn_${this.currentAnimKey}`);

    let spotlight = this.add
      .graphics()
      .setAlpha(1)
      .fillCircle(player.x, player.y, player.width * 2)
      .createGeometryMask()
      .setInvertAlpha();

    let endScreen = this.add
      .graphics()
      .fillStyle(0x000000, 0.6)
      .fillRect(0, 0, this.scale.width, this.scale.height)
      .setMask(spotlight)
      .setDepth(2);

    // Add centered game over text
    this.add
      .text(
        this.scale.gameSize.width / 2,
        this.scale.displaySize.height / 3,
        'GAME OVER!',
        {
          fontSize: '64px',
          color: '#ff0000',
        }
      )
      .setDepth(3)
      .setOrigin(0.5);

    const button = this.add
      .text(
        this.scale.gameSize.width / 2,
        this.scale.displaySize.height / 2,
        'PLAY AGAIN',
        {
          fontFamily: 'Arial',
          fontSize: '32px',
          color: '#ffffff',
          align: 'center',
          fixedWidth: 260,
          backgroundColor: '#2d2d2d',
        }
      )
      .setPadding(24)
      .setDepth(3)
      .setOrigin(0.5);

    button.setInteractive({ useHandCursor: true });

    button.on('pointerover', () => {
      button.setBackgroundColor('#8d8d8d');
    });

    button.on('pointerout', () => {
      button.setBackgroundColor('#2d2d2d');
    });

    this.gameOver = true;

    button.once('pointerup', () => {
      this.scene.restart();
    });
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

    if (this.items.countActive(true) === 0) {
      //  A new batch of items to collect
      this.items.children.iterate((c) => {
        let child = c as Phaser.Physics.Arcade.Sprite;
        // Randomly choose a new location for the item on the canvas
        let newX = Phaser.Math.Between(
          child.displayWidth / 2,
          this.scale.displaySize.width - child.displayWidth / 2
        );
        let newY = Phaser.Math.Between(
          child.displayHeight / 2,
          this.scale.displaySize.height - child.displayHeight
        );
        child.enableBody(true, newX, newY, true, true);
        return true;
      });

      // Get moving obstacles from our obstacles group
      let movingObstacles = this.obstacles.getMatching('state', Motion.MOVING);
      // If we have moving obstacles in the obstacles group, randomly choose one and clone it.
      if (movingObstacles.length > 0) {
        let obstacle = movingObstacles[
          Phaser.Math.Between(0, movingObstacles.length - 1)
        ] as Phaser.Physics.Arcade.Sprite;
        let obX =
          player.x < 400
            ? Phaser.Math.Between(400, 800)
            : Phaser.Math.Between(0, 400);
        let clone = this.obstacles
          .create(obX, 0, obstacle.texture.key)
          .setData('physics', obstacle.getData('physics'));
        // Set the clone's motion
        switch (clone.getData('physics')) {
          case 'BOUNCE':
            clone
              .setBounce(1)
              .setCollideWorldBounds(true)
              .setVelocity(Phaser.Math.Between(-200, 200), 20)
              .setGravity(0);
            break;
          case 'FLOAT':
            clone.setGravity(0).setImmovable();
            (clone.body as Phaser.Physics.Arcade.Body)?.setDirectControl();
            this.tweens.add({
              targets: clone,
              y: 600,
              duration: 3000,
              ease: 'sine.inout',
              yoyo: true,
              repeat: -1,
            });
            break;
          default:
            break;
        }
      }
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
      if (this.effectKey == 'spotlight' && this.effect) {
        this.effect
          .setX(
            (this.getGameObject('player') as Phaser.Physics.Arcade.Sprite).x
          )
          .setY(
            (this.getGameObject('player') as Phaser.Physics.Arcade.Sprite).y
          );
      }
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
      }
      (this.getGameObject('player') as Phaser.Physics.Arcade.Sprite).anims.play(
        `turn_${this.currentAnimKey}`,
        true
      );
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
