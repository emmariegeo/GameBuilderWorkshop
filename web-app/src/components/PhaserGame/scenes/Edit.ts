/** @type {import("../typings/phaser")} */
import * as Phaser from 'phaser';
import { data as assets } from '../../../data/assets.ts';

let PLAYER_X = 100;
let PLAYER_Y = 450;
let background = assets['backgrounds']['bg1'];
let mode = 'edit'

export default class Edit extends Phaser.Scene {
    logo!: Phaser.GameObjects.Image;
    bg!: Phaser.GameObjects.Image;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    platforms!: Phaser.Physics.Arcade.StaticGroup;
    modeButton!: Phaser.GameObjects.Text;
    constructor() {
        super('demo');
    }

    preload() {
        this.load.image('logo', './assets/phaser3-logo.png');
        this.load.image('bg', background['img']);
        this.load.glsl('bundle', '../assets/plasma-bundle.glsl.js');
        this.load.glsl('stars', '../assets/starfields.glsl.js');
        this.load.image('ground', '../assets/platform.png');
        // this.load.spritesheet('player', 'assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });
        this.load.spritesheet('player', '../assets/sprites/pinkman.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {

        //  The platforms group contains the ground and the 2 ledges we can jump on
        this.platforms = this.physics.add.staticGroup();
        this.add.image(this.scale.width / 4, this.scale.height / 4, 'bg');
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
        if (mode == 'edit') {
            this.physics.pause();
            this.player.setInteractive();
            this.input.setDraggable(this.player);
        } else if (mode == 'play') {
            this.physics.resume();
            this.player.setInteractive();
            this.input.setDraggable(this.player, false);
        }
    }
}