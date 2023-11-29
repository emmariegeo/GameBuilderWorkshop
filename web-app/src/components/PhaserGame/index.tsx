/** @type {import("../typings/phaser")} */
import * as Phaser from 'phaser';

// Import scene
import Edit from './scenes/Edit';
import { Component } from 'react';
import Play from './scenes/Play';
import BaseScene from './scenes/BaseScene';
import { Box } from '@mui/material';

type Props = {
  mode: string;
};

export default class PhaserGame extends Component<{}, Props> {
  constructor(props: any) {
    super(props);
    this.state = {
      mode: 'edit',
    };
  }

  componentDidMount() {
    const config = {
      type: Phaser.AUTO,
      parent: 'phaser-game',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 1500 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-game',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600,
      },
      scene: [Edit, Play, BaseScene],
    };
    new Phaser.Game(config);
  }
  shouldComponentUpdate() {
    return true;
  }
  render() {
    return <Box height={'auto'} id="phaser-game" />;
  }
}
