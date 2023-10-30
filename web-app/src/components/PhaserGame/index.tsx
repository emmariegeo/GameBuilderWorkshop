/** @type {import("../typings/phaser")} */
import * as Phaser from 'phaser';
import React from 'react';

// Import scene
import Edit from './scenes/Edit';

export default class PhaserGame extends React.Component {
    componentDidMount() {
        const config = {
            type: Phaser.AUTO,
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
                parent: "iframe-container",
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

