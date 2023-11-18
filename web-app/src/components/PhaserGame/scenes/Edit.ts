/** @type {import("../typings/phaser")} */
import * as Phaser from "phaser";
import {
  entityAdded,
  entityDeleted,
  entityUpdateXYZ,
  store,
  entityLoaded,
  select,
  entityUpdated,
  entityById,
  dialogOpened,
  deleteSuccess,
  entityUpdateScale,
} from "../../../store";
import { data as assets } from "../../../data/assets.ts";
import { Entity, EntityType, Tool } from "@/data/types.ts";
import { Dictionary } from "@reduxjs/toolkit";
import BaseScene from "./BaseScene.ts";

export default class Edit extends BaseScene {
  bg!: Phaser.GameObjects.Image;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  platforms!: Phaser.Physics.Arcade.StaticGroup;
  selectedGraphics!: Phaser.GameObjects.Graphics;
  resizeGroup!: Array<Phaser.GameObjects.Graphics>;
  gameEntities!: Dictionary<Entity>;
  gameObjects!: Map<string, Phaser.GameObjects.GameObject>;
  gameEntityIDs!: Array<string>;
  playerEntity: any;
  selected!: Phaser.GameObjects.Image | undefined;
  mode: any;
  tool!: Tool;
  constructor() {
    super('Edit');
    this.gameEntities = {};
  }

  init() {
    this.background = assets['backgrounds']['bg1'];
    this.gameEntityIDs = [];
    this.gameObjects = new Map();
    this.selected = this.player;
    this.tool = Tool.Select;
  }

  create() {
    // Subscribing to store so we can handle updates
    console.log("Running Edit", this);
    store.subscribe(this.onStoreChange.bind(this));
    // Getting the initial state from the store
    let initialState = store.getState();
    this.mode = initialState.canvas.mode;
    this.background = initialState.canvas.background;
    this.tool = initialState.canvas.tool;

    // Input Events
    this.cursors = this.input?.keyboard?.createCursorKeys();

    // Making shallow copy of entities dictionary from the store
    this.gameEntities = { ...initialState.entities.entities };

    // Instantiating bg object
    this.bg = this.add.image(this.scale.width / 4, this.scale.height / 4, "bg");
    // Setting with existing background value
    this.setBackground(this.background);

    // The platforms group will contain the ground and the ledges we can jump on
    this.platforms = this.physics.add.staticGroup();

    // We want to create a game object for each entry in gameEntities
    Object.entries(this.gameEntities).forEach((entry) => {
      entry[1] && !entry[1].loaded && this.createGameObject(entry[1]);
    });

    this.scale.on("resize", this.resize, this);
    this.physics.pause();
    // Graphics
    this.selectedGraphics = this.add.graphics();
    this.resizeGroup = new Array();
    this.resizeGroup.push(...[this.add.graphics().setName('TL'), this.add.graphics().setName('TR'), this.add.graphics().setName('BR'), this.add.graphics().setName('BL')]);
    // Set editor behavior based on current tool
    this.setTool(this.tool);
  }

  // Set the canvas mode
  setMode(newMode: string) {
    if (newMode == "edit") {
      this.mode = newMode;
      this.setTool(this.tool);
    } else if (newMode == "play") {
      this.mode = newMode;
      this.scene.start("Play");
    }
  }

  /**
   * Set editor behavior based on the current tool selected.
   * @param newTool Tool
   */
  setTool(newTool: Tool) {
    this.tool = newTool;
    switch (newTool) {
      case Tool.Select:
        if (this.gameObjects.has('player')) {
          let player = this.getSpriteObject('player');
          player?.setInteractive();
          player && this.input.setDraggable(player);
        }
        if (this.platforms) {
          this.platforms
            .getChildren()
            .forEach((child) => child.setInteractive());
          this.input.setDraggable(this.platforms.getChildren());
        }
        break;
      case Tool.Resize:
        if (this.gameObjects.has('player')) {
          let player = this.getSpriteObject('player');
          player?.setInteractive();
          player && this.input.setDraggable(player, false);
        }
        if (this.platforms) {
          this.platforms
            .getChildren()
            .forEach((child) => child.setInteractive());
          this.input.setDraggable(this.platforms.getChildren(), false);
        }
        this.selected && this.showResize(this.selected);
        break;
      default:
        if (this.gameObjects.has('player')) {
          let player = this.getSpriteObject('player');
          player?.setInteractive();
          player && this.input.setDraggable(player, false);
        }
        if (this.platforms) {
          this.platforms
            .getChildren()
            .forEach((child) => child.setInteractive());
          this.input.setDraggable(this.platforms.getChildren(), false);
        }
        break;
    }
  }

  // Pass in object to show the bounds on
  showBounds(object: Phaser.GameObjects.Image) {
    if (this.tool == Tool.Resize) {
      this.resizeGroup.forEach((item) => {
        item.clear();
        item.lineStyle(2, 0x0033cc).fillStyle(0xffffff)
      })
      this.showResize(object);
    } else {
      this.resizeGroup.forEach((item) => {
        item.clear();
      })
      let bounds = object.getBounds();
      // Clear and redraw on each update
      this.selectedGraphics.clear();
      this.selectedGraphics.lineStyle(2, 0xff0000);
      this.selectedGraphics.strokeRectShape(bounds);
    }
  }

  // Pass in object to show resize bounds
  showResize(object: Phaser.GameObjects.Image) {
    let bounds = object.getBounds();
    // Clear and redraw on each update
    this.selectedGraphics.clear();
    this.selectedGraphics.lineStyle(2, 0x0033cc);
    this.selectedGraphics.strokeRectShape(bounds).setDepth(2);
    let TL = this.resizeGroup[0];
    let TR = this.resizeGroup[1];
    let BR = this.resizeGroup[2];
    let BL = this.resizeGroup[3];

    TR.fillCircle(bounds.right, bounds.top, 4).strokeCircle(bounds.right, bounds.top, 4).setDepth(2);
    if (TR.input) {
      // Setting value manually because calling setInteractive on a Graphics object will not replace an existing hitArea
      TR.input.hitArea = new Phaser.Geom.Circle(bounds.right, bounds.top, 4);
    } else {
      TR.setInteractive(new Phaser.Geom.Circle(bounds.right, bounds.top, 4), Phaser.Geom.Circle.Contains);
      this.input.setDraggable(TR);
    }

    TL.fillCircle(bounds.left, bounds.top, 4).strokeCircle(bounds.left, bounds.top, 4).setDepth(2);
    if (TL.input) {
      TL.input.hitArea = new Phaser.Geom.Circle(bounds.left, bounds.top, 4);
    } else {
      TL.setInteractive(new Phaser.Geom.Circle(bounds.left, bounds.top, 4), Phaser.Geom.Circle.Contains);
      this.input.setDraggable(TL);
    }

    BL.fillCircle(bounds.left, bounds.bottom, 4).strokeCircle(bounds.left, bounds.bottom, 4).setDepth(2);
    if (BL.input) {
      BL.input.hitArea = new Phaser.Geom.Circle(bounds.left, bounds.bottom, 4);
    } else {
      BL.setInteractive(new Phaser.Geom.Circle(bounds.left, bounds.bottom, 4), Phaser.Geom.Circle.Contains);
      this.input.setDraggable(BL);
    }

    BR.fillCircle(bounds.right, bounds.bottom, 4).strokeCircle(bounds.right, bounds.bottom, 4).setDepth(2);
    if (BR.input) {
      BR.input.hitArea = new Phaser.Geom.Circle(bounds.right, bounds.bottom, 4);
    } else {
      BR.setInteractive(new Phaser.Geom.Circle(bounds.right, bounds.bottom, 4), Phaser.Geom.Circle.Contains);
      this.input.setDraggable(BR);
    }

    TR.input && (TR.input.cursor = 'url(assets/cursors/TR_resize.ico) 12 12, pointer');
    TL.input && (TL.input.cursor = 'url(assets/cursors/TL_resize.ico) 12 12, pointer');
    BL.input && (BL.input.cursor = 'url(assets/cursors/TR_resize.ico) 12 12, pointer');
    BR.input && (BR.input.cursor = 'url(assets/cursors/TL_resize.ico) 12 12, pointer');
  }

  // ---- START METHODS FOR INTERACTING WITH STORE ----

  // When changes are made to the store, update game
  onStoreChange() {
    // Confirm scene is active
    if (this.scene.isActive()) {
      const state = store.getState();
      if (state.canvas.mode !== this.mode) {
        this.setMode(state.canvas.mode);
      }
      if (state.canvas.background !== this.background) {
        this.setBackground(state.canvas.background.toString());
      }
      if (state.canvas.tool !== this.tool) {
        this.setTool(state.canvas.tool);
      }
      if (state.entities.deletion === 'pending') {
        this.gameObjects.forEach((value, id) => {
          console.log(this.gameObjects, state.entities.entities[id], state.entities.entities[id] === undefined)
          if (state.entities.entities[id] === undefined) {
            this.gameObjects.get(id)?.destroy(true);
            this.gameObjects.delete(id);
            this.selectedGraphics.clear();
            this.selected = undefined;
            this.gameEntities[id] = undefined;
          }
        });
        store.dispatch(deleteSuccess())
      }
      if (state.entities.entities !== this.gameEntities) {
        // We only want to load entities that are unloaded
        Object.entries(state.entities.entities)
          .filter(([, entity]) => {
            if (entity) return !entity.loaded;
          })
          .forEach(([, entity]) => {
            if (entity) {
              // If object has been created, reload it
              if (this.gameObjects.has(entity.id)) {
                this.loadGameObject(entity);
              } else {
                // If object has not been created in scene, create it.
                this.createGameObject(entity);
              }
              // Set entity id and value in gameEntities, used to track changes with entities in store.
              this.gameEntities[entity.id] = entity;
            }
          });
      }
    }

  }

  // Add a game object to store given an Entity
  addGameObject(object: Entity) {
    store.dispatch(entityAdded(object));
    this.gameEntities[object.id] = object;
  }

  // Open dialog for deleting game object
  deleteGameObject(object: Phaser.GameObjects.Image) {
    // Check for update delay between this.tool and store tool
    if (store.getState().canvas.tool == Tool.Delete) {
      store.dispatch(dialogOpened(true));
    }
  }

  // Update entire game object entity in store
  updateGameObject(object: Entity) {
    store.dispatch(
      entityUpdated({
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
          loaded: false,
        },
      })
    );
  }

  // Update game object position (x,y,z) values in store
  updateGameObjectPosition(id: string, x: number, y: number, z: number) {
    store.dispatch(
      entityUpdateXYZ({
        id: id,
        position: {
          x: x,
          y: y,
          z: z,
        },
      })
    );
  }

  // Update game object size values in store
  updateGameObjectSize(
    id: string,
    width: number,
    height: number,
    scaleX: number,
    scaleY: number,
    scale: number
  ) {
    store.dispatch(
      entityUpdateScale({
        id: id,
        size: {
          width: width,
          height: height,
          scaleX: scaleX,
          scaleY: scaleY,
          scale: scale
        },
      })
    );
  }

  // Load a given game object
  loadGameObject(object: Entity) {
    switch (object.type) {
      case (EntityType.Player):
        // We only will have one player, so we will swap the sprite texture
        // We check if the texture has been previously loaded
        if (
          this.gameObjects.has('player') &&
          this.getSpriteObject('player')?.texture.key !== `EDIT_${object.title}`
        ) {
          if (this.textures.exists(`EDIT_${object.title}`)) {
            this.getSpriteObject('player')?.setTexture(`EDIT_${object.title}`).setScale(object.scaleX, object.scaleY);
            this.getSpriteObject('player')?.setBodySize(object.width, object.height, true);
          } else {
            // We wait to switch the player sprite texture
            let loader = new Phaser.Loader.LoaderPlugin(this);
            loader.spritesheet(`EDIT_${object.title}`, object.spriteUrl, {
              frameWidth: object.width,
              frameHeight: object.height,
            });
            loader.once(Phaser.Loader.Events.COMPLETE, () => {
              // texture loaded, so replace
              this.getSpriteObject('player')?.setTexture(`EDIT_${object.title}`).setScale(object.scaleX, object.scaleY);
              this.getSpriteObject('player')?.setBodySize(object.width, object.height, true);
            });
            loader.start();
          }
          this.gameObjects.get('player')?.setData('id', object.id);
        } else if (!this.gameObjects.has('player')) {
          if (this.textures.exists(`EDIT_${object.title}`)) {
            this.gameObjects.set(
              'player', this.physics.add.sprite(object.x, object.y, `EDIT_${object.title}`)
            );
            let player = this.gameObjects.get('player');
            player && this.physics.add.existing(player, false)
            this.getSpriteObject('player')?.setScale(object.scaleX, object.scaleY).setBodySize(object.width, object.height, true);
            this.gameObjects.get('player')?.setData('id', object.id);
            this.getSpriteObject('player')?.refreshBody();
          } else {
            // We wait to switch the player sprite texture
            let loader = new Phaser.Loader.LoaderPlugin(this);
            loader.spritesheet(`EDIT_${object.title}`, object.spriteUrl, {
              frameWidth: object.width,
              frameHeight: object.height,
            });
            loader.once(Phaser.Loader.Events.COMPLETE, () => {
              this.gameObjects.set(
                'player', this.physics.add.sprite(object.x, object.y, `EDIT_${object.title}`)
              );
              let player = this.gameObjects.get('player');
              player && this.physics.add.existing(player, false)
              this.getSpriteObject('player')?.setScale(object.scaleX, object.scaleY).setBodySize(object.width, object.height, true);
              this.gameObjects.get('player')?.setData('id', object.id);
              this.getSpriteObject('player')?.refreshBody();
            });
            loader.start();
          }
        }
        break;
      case (EntityType.Platform):
        // Game Object exists but has the incorrect texture
        if (
          this.gameObjects.has(object.id) &&
          this.getSpriteObject(object.id)?.texture.key !== `EDIT_${object.title}`
        ) {
          // If the correct texture exists, update the object texture
          if (this.textures.exists(`EDIT_${object.title}`)) {
            let platform = this.getGameObject(object.id);
            platform && this.platforms.remove(platform, true);
            this.getSpriteObject(object.id)?.setTexture(`EDIT_${object.title}`).setScale(object.scaleX, object.scaleY);
            this.getGameObject(object.id)?.setData('id', object.id);
            this.getGameObject(object.id)?.setInteractive();
            this.getSpriteObject(object.id)?.setBodySize(object.width, object.height, true);
            platform = this.getGameObject(object.id);
            platform && this.input.setDraggable(platform);
            platform && this.platforms.add(platform);
            this.platforms.refresh();
          } else {
            // If not, we wait to switch the object texture
            let loader = new Phaser.Loader.LoaderPlugin(this);
            loader.image(`EDIT_${object.title}`, object.spriteUrl);
            loader.once(Phaser.Loader.Events.COMPLETE, () => {
              // texture loaded, so replace
              let platform = this.getGameObject(object.id);
              platform && this.platforms.remove(platform, true);
              this.getSpriteObject(object.id)?.setTexture(`EDIT_${object.title}`).setScale(object.scaleX, object.scaleY);
              this.getGameObject(object.id)?.setData('id', object.id);
              this.getGameObject(object.id)?.setInteractive();
              this.getSpriteObject(object.id)?.setBodySize(object.width, object.height, true);
              platform = this.getGameObject(object.id);
              platform && this.input.setDraggable(platform);
              platform && this.platforms.add(platform);
              this.platforms.refresh();
            });
            loader.start();
          }
          // Game Object does not exist
        } else if (!this.gameObjects.has(object.id)) {
          if (this.textures.exists(`EDIT_${object.title}`)) {
            this.gameObjects.set(object.id, this.physics.add.staticSprite(object.x, object.y, `EDIT_${object.title}`).setScale(object.scaleX, object.scaleY));
            this.getGameObject(object.id)?.setData('id', object.id);
            this.getGameObject(object.id)?.setInteractive();
            let platform = this.getGameObject(object.id);
            platform && this.platforms.add(platform);
            platform && this.input.setDraggable(platform);
          } else {
            // We wait to switch the platform texture
            let loader = new Phaser.Loader.LoaderPlugin(this);
            loader.image(`EDIT_${object.title}`, object.spriteUrl);
            loader.once(Phaser.Loader.Events.COMPLETE, () => {
              // texture loaded, so replace
              this.gameObjects.set(object.id, this.physics.add.staticSprite(object.x, object.y, `EDIT_${object.title}`).setScale(object.scaleX, object.scaleY));
              this.getGameObject(object.id)?.setData('id', object.id);
              this.getGameObject(object.id)?.setInteractive();
              let platform = this.getGameObject(object.id);
              platform && this.platforms.add(platform);
              platform && this.input.setDraggable(platform);
            });
            loader.start();
          }
        }
        break;
      default:
        break;
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
    this.loadGameObject(object);
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

  update() {
    // Drag objects in edit mode
    if (this.tool == Tool.Select) {
      this.input.on(
        "drag",
        (
          pointer: any,
          gameObject: Phaser.GameObjects.Image,
          dragX: number,
          dragY: number
        ) => {
          gameObject.x = dragX;
          gameObject.y = dragY;
          this.platforms.refresh();
        }
      );
      // update object position on mouse click release (or when drag is complete)
      this.input.on(
        "gameobjectup",
        (pointer: any, gameObject: Phaser.GameObjects.Image) => {
          this.updateGameObjectPosition(
            gameObject.getData('id'),
            gameObject.x,
            gameObject.y,
            1
          );
        }
      );
    }
    if (this.tool == Tool.Delete) {
      this.input.once(
        "gameobjectup",
        (pointer: any, gameObject: Phaser.GameObjects.Image) => {
          this.deleteGameObject(gameObject)
        }
      );
    }

    if (this.tool == Tool.Resize) {
      this.input.on(
        "drag",
        (
          pointer: any,
          gameObject: Phaser.GameObjects.Image,
          dragX: number,
          dragY: number
        ) => {
          if (store.getState().canvas.tool == Tool.Resize) {
            this.selected && this.showResize(this.selected);
            switch (gameObject.name) {
              case ('TL'):
                this.selected && (this.selected.displayWidth = this.selected.width - (dragX - gameObject.x));
                this.selected && (this.selected.displayHeight = this.selected.height - (dragY - gameObject.y));
                break;
              case ('TR'):
                this.selected && (this.selected.displayWidth = this.selected.width + (dragX - gameObject.x));
                this.selected && (this.selected.displayHeight = this.selected.height - (dragY - gameObject.y));
                break;
              case ('BR'):
                this.selected && (this.selected.displayWidth = this.selected.width + (dragX - gameObject.x));
                this.selected && (this.selected.displayHeight = this.selected.height + (dragY - gameObject.y));
                break;
              case ('BL'):
                this.selected && (this.selected.displayWidth = this.selected.width - (dragX - gameObject.x));
                this.selected && (this.selected.displayHeight = this.selected.height + (dragY - gameObject.y));
                break;
              default:
                this.showResize(gameObject)
                break;
            }
          }
        }
      );
      this.input.on(
        'dragend',
        (pointer: any, gameObject: Phaser.GameObjects.Image) => {
          if (store.getState().canvas.tool == Tool.Resize) {
            if (this.selected) {
              this.updateGameObjectSize(
                this.selected.getData('id'),
                this.selected.displayWidth,
                this.selected.displayHeight,
                this.selected.scaleX,
                this.selected.scaleY,
                this.selected.scale,
              );

            }
          }
        }
      );
    }

    // Select game object on click
    this.input.on(
      "gameobjectdown",
      (pointer: any, gameObject: Phaser.GameObjects.Image) => {
        if (gameObject.getData('id')) {
          this.selected = gameObject;
          this.selectObject(gameObject);
        }
      }
    );
    this.mode !== Tool.Resize && this.selected && this.showBounds(this.selected);
  }
}
