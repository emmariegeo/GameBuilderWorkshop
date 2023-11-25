/** @type {import("../typings/phaser")} */
import * as Phaser from 'phaser';
import { data as assets } from '../../../data/assets.ts';
import { Dictionary } from '@reduxjs/toolkit';
import { Entity, EntityType } from '@/data/types.ts';
import { modeSwitched, store } from '@/store.ts';

// Provides methods shared between Edit and Play Scenes
export default class BaseScene extends Phaser.Scene {
  gameEntities!: Dictionary<Entity>;
  background: any;
  gameEntityIDs!: Array<string>;
  gameObjects!: Map<string, Phaser.GameObjects.GameObject>;
  bg: any;
  audio!: string;
  soundObject:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound
    | undefined;

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
    this.load.image('bomb', '../assets/obstacles/bomb.png');
  }
  /**
   * Load a given entity into a game object
   * @param object Entity
   */
  loadGameObject(object: Entity) {
    switch (object.type) {
      case EntityType.Player:
        this.loadPlayer(object);
        break;
      case EntityType.Platform:
        this.loadPlatform(object);
        break;
      case EntityType.Item:
        this.loadItem(object);
        break;
      case EntityType.Obstacle:
        this.loadObstacle(object);
        break;
      default:
        break;
    }
  }

  loadObstacle(object: Entity) {
    throw new Error('Method not implemented.');
  }
  loadItem(object: Entity) {
    throw new Error('Method not implemented.');
  }
  loadPlatform(object: Entity) {
    throw new Error('Method not implemented.');
  }
  loadPlayer(object: Entity) {
    throw new Error('Method not implemented.');
  }

  getGameObject(key: string) {
    let object = this.gameObjects.get(key);
    return object;
  }

  /**
   * Set the new background
   * @param newBackground string referring to background asset key
   */
  setBackground(newBackground: string) {
    // Confirm that background exists in assets
    if (newBackground in assets['backgrounds']) {
      this.background = newBackground;
      // We wait to set the background image to the new texture until the image has been loaded in.
      let loader = new Phaser.Loader.LoaderPlugin(this);
      loader.image(newBackground, assets['backgrounds'][newBackground]['img']);
      loader.once(Phaser.Loader.Events.COMPLETE, () => {
        // texture loaded, so replace
        this.bg.setTexture(newBackground);
      });
      loader.start();
    }
  }

  /**
   * Set the new background
   * @param newBackground string referring to background asset key
   */
  setAudio(newAudio: string) {
    // Confirm that background exists in assets
    if (newAudio in assets['audio']) {
      this.audio = newAudio;
      // We wait to set the background image to the new texture until the image has been loaded in.
      let loader = new Phaser.Loader.LoaderPlugin(this);
      loader.audio(newAudio, assets['audio'][newAudio]['file'], {
        stream: true,
      });
      loader.once(Phaser.Loader.Events.COMPLETE, () => {
        // texture loaded, so replace
        if (this.soundObject) {
          this.soundObject.destroy();
        }
        this.soundObject = this.sound.add(newAudio);
      });
      loader.start();
    }
  }

  /**
   * Set the mode to edit or play
   * @param newMode string representing canvas mode
   */
  setMode(newMode: string) {
    // Using modeSwitched state and scene getStatus to avoid creating scene multiple times when switching
    store.dispatch(modeSwitched());
    if (newMode === 'edit' && this.scene.key === 'Play') {
      this.soundObject?.destroy();
      if (
        this.scene.getStatus('Play') === Phaser.Scenes.RUNNING &&
        (this.scene.getStatus('Edit') > Phaser.Scenes.RUNNING ||
          this.scene.getStatus('Edit') < Phaser.Scenes.START)
      ) {
        this.scene.start('Edit');
      }
    } else if (newMode === 'play' && this.scene.key === 'Edit') {
      if (
        this.scene.getStatus('Edit') === Phaser.Scenes.RUNNING &&
        (this.scene.getStatus('Play') > Phaser.Scenes.RUNNING ||
          this.scene.getStatus('Play') < Phaser.Scenes.START)
      ) {
        this.scene.start('Play');
      }
    }
  }
}
