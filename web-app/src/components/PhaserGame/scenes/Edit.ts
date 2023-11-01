/** @type {import("../typings/phaser")} */
import * as Phaser from 'phaser';
import { store } from '../../../store';
import { data as assets } from '../../../data/assets.ts';

let PLAYER_X = 100;
let PLAYER_Y = 450;

export default class Edit extends Phaser.Scene {
    logo!: Phaser.GameObjects.Image;
    bg!: Phaser.GameObjects.Image;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    platforms!: Phaser.Physics.Arcade.StaticGroup;
    background: any;
    constructor() {
        super('Edit');
        this.background = assets['backgrounds']['bg1'];
    }

    preload() {
        this.load.image('logo', './assets/phaser3-logo.png');
        this.load.image('bg', this.background['img']);
        this.load.glsl('bundle', '../assets/plasma-bundle.glsl.js');
        this.load.glsl('stars', '../assets/starfields.glsl.js');
        this.load.image('ground', '../assets/platform.png');
        // this.load.spritesheet('player', 'assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });
        this.load.spritesheet('player', '../assets/sprites/pinkman.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        store.subscribe(this.onStoreChange.bind(this))
        //  The platforms group contains the ground and the 2 ledges we can jump on
        this.platforms = this.physics.add.staticGroup();
        this.bg = this.add.image(this.scale.width / 4, this.scale.height / 4, 'bg');
        //  Here we create the ground.
        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        this.player = this.physics.add.sprite(PLAYER_X, PLAYER_Y, 'player');
        this.player.setCollideWorldBounds(true);
        //  Player physics properties. Give the little guy a slight bounce.
        this.player.setBounce(0.2);
        //  Input Events
        this.cursors = this.input.keyboard.createCursorKeys();
        this.scale.on('resize', this.resize, this);
        this.physics.pause();
        this.player.setInteractive();
        this.input.setDraggable(this.player);
    }

    onStoreChange() {
        const state = store.getState();
        if (state.mode == 'edit') {
            this.setMode('edit');
        } else if (state.mode == 'play') {
            this.setMode('play');
        }
        if (state.background !== this.background) {
            this.setBackground(state.background.toString());
        }
    }

    setMode(newMode: string) {
        if (newMode == 'edit') {
            this.physics.pause();
            this.player.setInteractive();
            this.input.setDraggable(this.player);
        } else if (newMode == 'play') {
            this.physics.resume();
            this.player.setInteractive();
            this.input.setDraggable(this.player, false);
        }
    }

    setBackground(newBackground: string) {
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

    resize(gameSize: { width: any; height: any; }, baseSize: any, displaySize: any, resolution: any) {
        const width = gameSize.width;
        const height = gameSize.height;

        this.cameras.resize(width, height);

        this.player.setSize(width / 4, height / 4);
        this.player.setPosition(PLAYER_X, PLAYER_Y);
    }

    update() {
        this.input.on('drag', (pointer: any, gameObject: { x: any; y: any; }, dragX: number, dragY: number) => {
            gameObject.x = dragX;
            PLAYER_X = dragX;
            gameObject.y = dragY;
            PLAYER_Y = dragY;
        });

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }

    }
}

