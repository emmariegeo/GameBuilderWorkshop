/** @type {import("../typings/phaser")} */
import * as Phaser from 'phaser';

// Import scene
import Edit from './scenes/Edit';
import { Component } from 'react';

type Props = {
    mode: string;
}

export default class PhaserGame extends Component<{}, Props> {
    constructor(props: any) {
        super(props);
        this.state = {
            mode: 'edit'
        };
    }

    componentDidMount() {
        const config = {
            type: Phaser.CANVAS,
            parent: 'phaser-game',
            width: 800,
            height: 600,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 1500 },
                    debug: false,
                },
            },
            scale: {
                parent: 'phaser-game',
                autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
            },
            scene: [Edit],
        };
        new Phaser.Game(config);
    }
    shouldComponentUpdate() {
        return false;
    }
    render() {
        return <div id="phaser-game" />;
    }
}