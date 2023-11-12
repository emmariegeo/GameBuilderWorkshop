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
} from "../../../store";
import { data as assets } from "../../../data/assets.ts";
import { Entity, EntityType, Tool } from "@/data/types.ts";
import { Dictionary } from "@reduxjs/toolkit";

export default class Edit extends Phaser.Scene {
  bg!: Phaser.GameObjects.Image;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  platforms!: Phaser.Physics.Arcade.StaticGroup;
  background: any;
  selectedGraphics!: Phaser.GameObjects.Graphics;
  gameEntities!: Dictionary<Entity>;
  gameObjects!: Map<string, Phaser.GameObjects.GameObject>;
  gameEntityIDs!: Array<string>;
  playerEntity: any;
  selected!: Phaser.GameObjects.Image;
  mode: any;
  tool!: Tool;
  constructor() {
    super({ key: "Edit" });
    this.gameEntities = {};
  }

  init() {
    this.background = assets["backgrounds"]["bg1"];
    this.gameEntityIDs = [];
    this.gameEntities = {};
    this.gameObjects = new Map();
    this.selected = this.player;
    this.tool = Tool.Select;
  }

  preload() {
    this.load.image("bg", this.background["img"]);
    this.load.image("ground", "../assets/platform.png");
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
    this.cursors = this.input.keyboard.createCursorKeys();

    // Making shallow copy of entities dictionary from the store
    this.gameEntities = { ...initialState.entities.entities };

    this.bg = this.add.image(this.scale.width / 4, this.scale.height / 4, "bg");
    // We want to create a game object for each entry in gameEntities
    Object.entries(this.gameEntities).forEach((entry) => {
      entry[1] && this.createGameObject(entry[1]);
      console.log(entry[1]);
    });
    // The platforms group contains the ground and the 2 ledges we can jump on
    this.platforms = this.physics.add.staticGroup();
    // Here we create the ground.
    // Scale it to fit the width of the game (the original sprite is 400x32 in size)
    this.platforms.create(400, 568, "ground").setScale(2).refreshBody();
    // Now let's create some ledges
    this.platforms.create(600, 400, "ground");
    this.platforms.create(50, 250, "ground");
    this.platforms.create(750, 220, "ground");

    this.scale.on("resize", this.resize, this);
    this.physics.pause();
    if (this.gameObjects.has('player')) {
      this.gameObjects.get('player').setInteractive();
      this.gameObjects.get('player').setCollideWorldBounds(true);
      this.gameObjects.get('player').setData('id', 'player');
      this.input.setDraggable(this.gameObjects.get('player'));
      this.setAnimations('player');
    }
    // Graphics
    this.selectedGraphics = this.add.graphics();
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
          this.gameObjects.get('player').setInteractive();
          // TODO: Generalize to loop through game objects
          this.input.setDraggable(this.gameObjects.get('player'));
        }
        if (this.platforms) {
          this.platforms
            .getChildren()
            .forEach((child) => child.setInteractive());
          this.input.setDraggable(this.platforms.getChildren());
        }
        break;
      default:
        break;
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
      loader.image(newBackground, assets["backgrounds"][newBackground]["img"]);
      loader.once(Phaser.Loader.Events.COMPLETE, () => {
        // texture loaded, so replace
        this.bg.setTexture(newBackground);
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
                console.log('Already created, loading', entity);
              } else {
                // If object has not been created in scene, create it.
                this.createGameObject(entity);
                this.loadGameObject(entity);
                console.log('Created and loaded', entity);
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

  // Update game object scale values in store
  updateGameObjectScale(
    id: string,
    width: number,
    height: number,
    scale: number
  ) {
    //
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
        if (this.textures.exists(object.spriteUrl)) {
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
            this.gameObjects.get('player')?.setTexture(object.spriteUrl);
            this.gameObjects
              .get('player')
              .setBodySize(object.width, object.height, true);
            // We set the entity's "loaded" property to true
            this.setAnimations(object.id);
          });
          loader.start();
        }
        this.gameObjects.get('player')?.setData('id', object.id);
      }
      entityLoaded(object);
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
    this.updateGameObject(object);
  }

  setAnimations(key: string) {
    // Player Animations
    this.anims.remove("left");
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.remove("turn");
    this.anims.create({
      key: "turn",
      frames: [{ key: key, frame: 4 }],
      frameRate: 20,
    });
    this.anims.remove("right");
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers(key, { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
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
          if (this.mode == "edit") {
            this.updateGameObjectPosition(
              gameObject.getData('id'),
              gameObject.x,
              gameObject.y,
              1
            );
          }
        }
      );
    }
    // Select game object on click
    this.input.on(
      "gameobjectdown",
      (pointer: any, gameObject: Phaser.GameObjects.Image) => {
        this.selected = gameObject;
        this.selectObject(gameObject);
      }
    );
    this.selected && this.showBounds(this.selected);
  }
}
