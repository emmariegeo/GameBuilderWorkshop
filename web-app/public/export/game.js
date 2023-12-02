import { data } from './gamedata.js';
var game;
// Used to differentiate between moving and still game objects.
const Motion = {
  STILL: 0,
  MOVING: 1,
};

class LaunchScene extends Phaser.Scene {
  constructor() {
    super('LaunchScene');
  }
  preload() {
    this.load.image('bg', data.background.img);
  }
  create() {
    this.bg = this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'bg')
      .setDepth(0);

    const button = this.add
      .text(
        this.scale.gameSize.width / 2,
        this.scale.gameSize.height / 2,
        'START GAME',
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
      this.scene.start('YourGame');
    });
  }
}
class YourGame extends Phaser.Scene {
  player;
  bg;
  audio;
  effect;
  effectKey;
  items;
  obstacles;
  platforms;
  cursors;
  scoreText;
  currentAnimKey;

  constructor() {
    super('YourGame');
  }
  preload() {
    this.load.image('bg', data.background.img);
    this.load.audio(data.audio.title, data.audio.file, {
      stream: true,
    });
  }

  create() {
    this.audio && this.audio.destroy();
    this.gameObjects = new Map();
    this.gameEntities = data.entities;
    this.score = 0;
    this.gameOver = false;
    this.bg = this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'bg')
      .setDepth(0);
    this.effectKey = data.effect.title;

    if (this.effectKey === 'spotlight') {
      this.effect = this.lights
        .addLight(0, 0, 200, 0xfffde7)
        .setScrollFactor(0)
        .setIntensity(1);

      this.lights.enable().setAmbientColor(0x555555);
      this.bg.setPipeline('Light2D');
    }

    this.audio = this.sound.add(data.audio.title, { loop: true });
    if (!this.sound.locked && !this.audio?.isPlaying) {
      this.audio.play();
    } else {
      // wait for 'unlocked' to fire and then play
      this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
        this.audio.play();
      });
    }
    this.cursors = this.input.keyboard?.createCursorKeys();
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

    this.player = this.getGameObject('player');
    console.log(this);
  }

  /**
   * Load a given entity into a game object
   * @param object Entity
   */
  loadGameObject(object) {
    switch (object.type) {
      case 'PLAYER':
        this.loadPlayer(object);
        break;
      case 'PLATFORM':
        this.loadPlatform(object);
        break;
      case 'ITEM':
        this.loadItem(object);
        break;
      case 'OBSTACLE':
        this.loadObstacle(object);
        break;
      default:
        break;
    }
  }

  getGameObject(key) {
    let object = this.gameObjects.get(key);
    return object;
  }

  /**
   * Load the player object
   * @param object Entity
   */
  loadPlayer(object) {
    // We check if the texture has been previously loaded
    if (this.textures.exists(`PLAY_${object.title}`)) {
      if (this.gameObjects.has('player')) {
        if (this.player.texture.key === `PLAY_${object.title}`) return;
        this.player
          .setTexture(`PLAY_${object.title}`)
          .setScale(object.scaleX, object.scaleY);
      } else {
        this.gameObjects.set(
          'player',
          this.physics.add.sprite(object.x, object.y, `PLAY_${object.title}`)
        );

        this.player = this.gameObjects.get('player');
        this.player
          .setInteractive()
          .setCollideWorldBounds(true)
          .setBounce(0.2)
          .setScale(object.scaleX, object.scaleY)
          .setData({ id: 'player', isFlipped: object.flipX })
          .setFlipX(object.flipX);
        this.physics.add.collider(this.player, this.platforms);
        // Checks to see if the player overlaps with any of the this.items, if player does, call the collectItem function
        this.physics.add.overlap(
          this.player,
          this.items,
          this.collectItem,
          undefined,
          this
        );
        // Checks to see if the player overlaps with any of the this.obstacles, if player does, call the collectthis.obstacles function
        this.physics.add.collider(
          this.player,
          this.obstacles,
          this.hitObstacle,
          undefined,
          this
        );
      }
      this.player.refreshBody();
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
          this.player
            .setTexture(`PLAY_${object.title}`)
            .setScale(object.scaleX, object.scaleY);
        } else {
          this.gameObjects.set(
            'player',
            this.physics.add.sprite(object.x, object.y, `PLAY_${object.title}`)
          );
          this.player = this.gameObjects.get('player');
          this.player
            .setInteractive()
            .setCollideWorldBounds(true)
            .setBounce(0.2)
            .setScale(object.scaleX, object.scaleY)
            .setData({ id: 'player', isFlipped: object.flipX })
            .setFlipX(object.flipX);

          this.physics.add.collider(this.player, this.platforms);
          // Checks to see if the player overlaps with any of the this.items, if player does, call the collectItem function
          this.physics.add.overlap(
            this.player,
            this.items,
            this.collectItem,
            undefined,
            this
          );
          // Checks to see if the player overlaps with any of the this.obstacles, if player does, call the collectthis.obstacles function
          this.physics.add.collider(
            this.player,
            this.obstacles,
            this.hitObstacle,
            undefined,
            this
          );
        }
        this.setAnimations(object.title);
        this.player.refreshBody();
      });
      loader.start();
    }
  }

  /**
   * Load a platform object
   * @param object Entity
   */
  loadPlatform(object) {
    let platform = this.getGameObject(object.id);
    // If the correct texture exists, update the object texture
    if (this.textures.exists(`PLAY_${object.title}`)) {
      if (this.gameObjects.has(object.id)) {
        if (platform.texture.key === `PLAY_${object.title}`) return;
        this.platforms.remove(platform, true);
        platform
          .setTexture(`PLAY_${object.title}`)
          .setScale(object.scaleX, object.scaleY);
      } else {
        this.gameObjects.set(
          object.id,
          this.physics.add
            .staticImage(object.x, object.y, `PLAY_${object.title}`)
            .setScale(object.scaleX, object.scaleY)
        );
        platform = this.getGameObject(object.id);
      }
      platform
        .setData({ id: object.id, isFlipped: object.flipX })
        .setFlipX(object.flipX)
        .refreshBody();
      this.platforms.add(platform);
      this.platforms.refresh();
    } else {
      // If not, we wait to switch the object texture
      let loader = this.load.image(`PLAY_${object.title}`, object.spriteUrl);
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
          platform = this.getGameObject(object.id);
        }
        platform
          .setData({ id: object.id, isFlipped: object.flipX })
          .setFlipX(object.flipX)
          .refreshBody();
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
  loadItem(object) {
    let item = this.getGameObject(object.id);
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
        item = this.getGameObject(object.id);
      }
      item
        .setData({ id: object.id, isFlipped: object.flipX })
        .setFlipX(object.flipX);
      item.body.collidWorldBounds = true;
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
          item = this.getGameObject(object.id);
        }
        item
          .setData({ id: object.id, isFlipped: object.flipX })
          .setFlipX(object.flipX)
          .setCollideWorldBounds(true);
        item.body.collidWorldBounds = true;
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
  loadObstacle(object) {
    let obstacle = this.getGameObject(object.id);
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
        obstacle = this.getGameObject(object.id);
      }
      obstacle
        .setData({
          id: object.id,
          physics: object.physics,
          isFlipped: object.flipX,
        })
        .setFlipX(object.flipX);
      this.obstacles.add(obstacle);
      switch (object.physics) {
        case 'BOUNCE':
          obstacle
            .setBounce(1)
            .setCollideWorldBounds(true)
            .setVelocity(Phaser.Math.Between(-200, 200), 20)
            .setGravity(0)
            .setState(Motion.MOVING);

          break;
        case 'FLOAT':
          obstacle.setGravity(0).setImmovable().setState(Motion.MOVING);
          obstacle.body?.setDirectControl();
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
          obstacle.setState(Motion.STILL);
          obstacle.body?.setAllowGravity(false);
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
          obstacle = this.getGameObject(object.id);
        }
        obstacle
          .setData({
            id: object.id,
            physics: object.physics,
            isFlipped: object.flipX,
          })
          .setFlipX(object.flipX);
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
            obstacle.body?.setDirectControl();
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
            obstacle.body?.setAllowGravity(false);
            obstacle.setState(Motion.STILL);
            break;
          default:
            break;
        }
      });
      loader.start();
    }
  }

  setAnimations(key) {
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
   * @param obstacle any (cast to Phaser.this.gameObjects.GameObject)
   */
  hitObstacle(player, obstacle) {
    this.physics.pause();

    this.player.setTint(0xff0000);
    this.player.anims.play(`turn_${this.currentAnimKey}`);

    let spotlight = this.add
      .graphics()
      .setAlpha(1)
      .fillCircle(this.player.x, this.player.y, this.player.width * 2)
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
        this.scale.gameSize.height / 3,
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
        this.scale.gameSize.height / 2,
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
  collectItem(player, item) {
    item.disableBody(true, true);

    //  Add and update the score
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    if (this.items.countActive(true) === 0) {
      //  A new batch of items to collect
      this.items.children.iterate((child) => {
        // Randomly choose a new location for the item on the canvas
        let newX = Phaser.Math.Between(
          child.displayWidth / 2,
          this.scale.displaySize.width - child.displayWidth / 2
        );
        let newY = Phaser.Math.Between(
          child.displayHeight / 2,
          this.scale.displaySize.height - child.displayHeight * 2
        );
        child
          .enableBody(true, newX, newY, true, true)
          .setCollideWorldBounds(true);
        return true;
      });

      // Get moving obstacles from our obstacles group
      let movingObstacles = this.obstacles.getMatching('state', Motion.MOVING);
      // If we have moving obstacles in the obstacles group, randomly choose one and clone it.
      if (movingObstacles.length > 0) {
        let obstacle =
          movingObstacles[Phaser.Math.Between(0, movingObstacles.length - 1)];
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
            clone.body?.setDirectControl();
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
    if (this.player) {
      if (this.effectKey == 'spotlight' && this.effect) {
        this.effect.setX(this.player.x).setY(this.player.y);
      }
      if (this.cursors?.left.isDown) {
        this.player?.setVelocityX(-160).setFlipX(!this.player.getData('isFlipped'));
        this.player?.anims.play(`left_${this.currentAnimKey}`, true);
      } else if (this.cursors?.right.isDown) {
        this.player?.setVelocityX(160).setFlipX(this.player.getData('isFlipped'));;
        this.player?.anims.play(`right_${this.currentAnimKey}`, true);
      } else {
        this.player?.setVelocityX(0).setFlipX(this.player.getData('isFlipped'));;
        this.player?.anims.play(`turn_${this.currentAnimKey}`, true);
      }
      if (this.cursors?.up.isDown && this.player?.body?.touching.down) {
        this.player?.setVelocityY(-830);
      }
    }
  }
}
var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'yourgame',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1500 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'yourgame',
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
  },
  scene: [LaunchScene, YourGame],
};

game = new Phaser.Game(config);
