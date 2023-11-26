import { data } from './gamedata.js';

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
    loadGameObject: loadGameObject,
    loadPlayer: loadPlayer
  },
};

var player;
var bg;
var audio;
var items;
var gameObjects = new Map();
var gameEntities = data.entities;
var obstacles;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var currentAnimKey;

var game = new Phaser.Game(config);

function preload () {
  this.load.image('bg', data.background.img);
  this.load.audio(data.audio.title, data.audio.file, {
    stream: true,
  });
}

function create () {
  bg = this.add
    .image(this.scale.width / 2, this.scale.height / 2, 'bg')
    .setDepth(0);

  audio = this.sound.add(data.audio.title, { loop: true });
  cursors = this.input.keyboard?.createCursorKeys();
  // The platforms group contains objects the player can jump on/collide with
  platforms = this.physics.add.staticGroup();
  // The items group contains objects the player can collect
  items = this.physics.add.group();
  // The obstacles group contains objects the player can hit
  obstacles = this.physics.add.group().setDepth(4);

  //  The score
  scoreText = this.add.text(16, 16, 'score: 0', {
    fontSize: '32px',
    color: '#000',
    backgroundColor: '#ffffff',
  });

  // We want to create a game object for each entry in gameEntities and add it to the appropriate group
  Object.entries(gameEntities).forEach((entry) => {
    entry[1] && !entry[1].loaded && loadGameObject(entry[1]);
  });

  this.physics.add.collider(items, platforms);

  player = getGameObject('player');
  console.log(this);
}

/**
 * Load a given entity into a game object
 * @param object Entity
 */
function loadGameObject(object) {
  switch (object.type) {
    case 'PLAYER':
      loadPlayer(object);
      break;
    case 'PLATFORM':
      loadPlatform(object);
      break;
    case 'ITEM':
      loadItem(object);
      break;
    case 'ITEM':
      loadObstacle(object);
      break;
    default:
      break;
  }
}
function getGameObject(key) {
  let object = gameObjects.get(key);
  return object;
}

/**
 * Load the player object
 * @param object Entity
 */
function loadPlayer(object) {
  // We only will have one player, so we will swap the sprite texture
  let player = gameObjects.get('player');

  // We check if the texture has been previously loaded
  if (game.textures.exists(`PLAY_${object.title}`)) {
    if (gameObjects.has('player')) {
      if (player.texture.key === `PLAY_${object.title}`) return;
      player
        .setTexture(`PLAY_${object.title}`)
        .setScale(object.scaleX, object.scaleY);
    } else {
      gameObjects.set(
        'player',
        this.physics.add.sprite(object.x, object.y, `PLAY_${object.title}`)
      );

      player = gameObjects.get('player');
      player
        .setInteractive()
        .setCollideWorldBounds(true)
        .setBounce(0.2)
        .setScale(object.scaleX, object.scaleY)
        .setData('id', 'player');
      this.physics.add.collider(player, platforms);
      // Checks to see if the player overlaps with any of the items, if player does, call the collectItem function
      this.physics.add.overlap(player, items, collectItem, undefined, this);
      // Checks to see if the player overlaps with any of the obstacles, if player does, call the collectobstacles function
      this.physics.add.collider(
        player,
        obstacles,
        hitObstacle,
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
      if (gameObjects.has('player')) {
        player
          .setTexture(`PLAY_${object.title}`)
          .setScale(object.scaleX, object.scaleY);
      } else {
        gameObjects.set(
          'player',
          this.physics.add.sprite(object.x, object.y, `PLAY_${object.title}`)
        );
        player = gameObjects.get('player');
        player
          .setInteractive()
          .setCollideWorldBounds(true)
          .setBounce(0.2)
          .setScale(object.scaleX, object.scaleY)
          .setData('id', 'player');

        this.physics.add.collider(player, platforms);
        // Checks to see if the player overlaps with any of the items, if player does, call the collectItem function
        this.physics.add.overlap(player, items, collectItem, undefined, this);
        // Checks to see if the player overlaps with any of the obstacles, if player does, call the collectobstacles function
        this.physics.add.collider(
          player,
          obstacles,
          hitObstacle,
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
function loadPlatform(object) {
  let platform = getGameObject(object.id);
  // If the correct texture exists, update the object texture
  if (this.textures.exists(`PLAY_${object.title}`)) {
    if (gameObjects.has(object.id)) {
      if (platform.texture.key === `EDIT_${object.title}`) return;
      platforms.remove(platform, true);
      platform
        .setTexture(`PLAY_${object.title}`)
        .setScale(object.scaleX, object.scaleY);
    } else {
      gameObjects.set(
        object.id,
        this.physics.add
          .staticImage(object.x, object.y, `PLAY_${object.title}`)
          .setScale(object.scaleX, object.scaleY)
      );
      platform = getGameObject(object.id);
    }
    platform.setData('id', object.id).refreshBody();
    platforms.add(platform);
    platforms.refresh();
  } else {
    // If not, we wait to switch the object texture
    let loader = new Phaser.Loader.LoaderPlugin(this);
    loader.image(`PLAY_${object.title}`, object.spriteUrl);
    loader.once(Phaser.Loader.Events.COMPLETE, () => {
      // Set texture on existing platform
      if (gameObjects.has(object.id)) {
        platforms.remove(platform, true);
        platform
          .setTexture(`PLAY_${object.title}`)
          .setScale(object.scaleX, object.scaleY);
      } else {
        // Set texture on new platform
        gameObjects.set(
          object.id,
          this.physics.add
            .staticImage(object.x, object.y, `PLAY_${object.title}`)
            .setScale(object.scaleX, object.scaleY)
        );
        platform = getGameObject(object.id);
      }
      platform.setData('id', object.id).refreshBody();
      platforms.add(platform);
      platforms.refresh();
    });
    loader.start();
  }
}

/**
 * Load item
 * @param object Entity
 * @returns
 */
function loadItem(object) {
  let item = getGameObject(object.id);
  // If texture exists, apply
  if (this.textures.exists(`PLAY_${object.title}`)) {
    if (
      gameObjects.has(object.id) &&
      item.texture.key !== `PLAY_${object.title}`
    ) {
      items.remove(item, true);
      item
        .setTexture(`PLAY_${object.title}`)
        .setScale(object.scaleX, object.scaleY);
    } else if (!this.gameObjects.has(object.id)) {
      gameObjects.set(
        object.id,
        this.physics.add
          .sprite(object.x, object.y, `PLAY_${object.title}`)
          .setScale(object.scaleX, object.scaleY)
      );
      item = getGameObject(object.id);
    }
    item.setData('id', object.id);
    items.add(item);
  } else {
    // If texture does not exist, load before applying
    let loader = new Phaser.Loader.LoaderPlugin(this);
    loader.image(`PLAY_${object.title}`, object.spriteUrl);
    loader.once(Phaser.Loader.Events.COMPLETE, () => {
      // texture loaded, so replace
      if (gameObjects.has(object.id)) {
        items.remove(item, true);
        item
          .setTexture(`PLAY_${object.title}`)
          .setScale(object.scaleX, object.scaleY);
      } else {
        gameObjects.set(
          object.id,
          this.physics.add
            .sprite(object.x, object.y, `PLAY_${object.title}`)
            .setScale(object.scaleX, object.scaleY)
        );
        item = getGameObject(object.id);
      }
      item.setData('id', object.id);
      items.add(item);
    });
    loader.start();
  }
}

/**
 * Load obstacle
 * @param object Entity
 * @returns
 */
function loadObstacle(object) {
  let obstacle = getGameObject(object.id);
  // If texture exists, apply
  if (this.textures.exists(`PLAY_${object.title}`)) {
    if (
      gameObjects.has(object.id) &&
      obstacle.texture.key !== `PLAY_${object.title}`
    ) {
      obstacles.remove(obstacle, true);
      obstacle
        .setTexture(`PLAY_${object.title}`)
        .setScale(object.scaleX, object.scaleY);
    } else if (!gameObjects.has(object.id)) {
      gameObjects.set(
        object.id,
        this.physics.add
          .sprite(object.x, object.y, `PLAY_${object.title}`)
          .setScale(object.scaleX, object.scaleY)
      );
      obstacle = getGameObject(object.id);
    }
    obstacle.setData('id', object.id);
    obstacles.add(obstacle);
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
        obstacle.body?.setAllowGravity(false);
        break;
      default:
        break;
    }
  } else {
    // If texture does not exist, load before applying
    let loader = new Phaser.Loader.LoaderPlugin(this);
    loader.image(`PLAY_${object.title}`, object.spriteUrl);
    loader.once(Phaser.Loader.Events.COMPLETE, () => {
      // texture loaded, so replace
      if (gameObjects.has(object.id)) {
        obstacles.remove(obstacle, true);
        obstacle
          .setTexture(`PLAY_${object.title}`)
          .setScale(object.scaleX, object.scaleY);
      } else {
        gameObjects.set(
          object.id,
          this.physics.add
            .sprite(object.x, object.y, `PLAY_${object.title}`)
            .setScale(object.scaleX, object.scaleY)
        );
        obstacle = getGameObject(object.id);
      }
      obstacle.setData('id', object.id);
      obstacles.add(obstacle);
      // Obstacles can have different behaviors
      switch (object.physics) {
        case 'BOUNCE': // Obstacle bounces around game canvas
          obstacle
            .setBounce(1)
            .setCollideWorldBounds(true)
            .setVelocity(Phaser.Math.Between(-200, 200), 20)
            .setGravity(0);
          break;
        case 'FLOAT': // Obstacle floats up and down
          obstacle.setGravity(0).setImmovable();
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
          break;
        default:
          break;
      }
    });
    loader.start();
  }
}

function setAnimations(key) {
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
function hitObstacle(player, obstacle) {
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

  gameOver = true;

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
function collectItem(player, item) {
  item.disableBody(true, true);

  //  Add and update the score
  score += 10;
  scoreText.setText('Score: ' + score);

  // TODO: set up items and obstacles
  if (items.countActive(true) === 0) {
    //  A new batch of items to collect
    items.children.iterate((child) => {
      child.enableBody(true, child.x, 0, true, true);
      return true;
    });

    let x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    let obstacle = obstacles.create(x, 16, 'bomb');
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
function update() {
  // End game, stop updates
  if (gameOver) {
    return;
  }

  // Player movement with arrow controls
  if (gameObjects.has('player')) {
    if (cursors?.left.isDown) {
      getGameObject('player').setVelocityX(-160);
      getGameObject('player').anims.play(`left_${currentAnimKey}`, true);
    } else if (cursors?.right.isDown) {
      getGameObject('player').setVelocityX(160);
      getGameObject('player').anims.play(`right_${currentAnimKey}`, true);
    } else {
      getGameObject('player').setVelocityX(0);
      getGameObject('player').anims.play(`turn_${currentAnimKey}`, true);
    }
    if (cursors?.up.isDown && getGameObject('player').body?.touching.down) {
      getGameObject('player')?.setVelocityY(-830);
    }
  }
}
