interface Map {
  [key: string]: {
    [id: string]: {
      img: string;
      title: string;
      width?: number;
      height?: number;
      physics?: string;
      file?: string;
      frames?: {};
    };
  };
}

// Data for base asset packs
export const data: Map = {
  backgrounds: {
    bg1: {
      img: '/assets/backgrounds/bluesky.png',
      title: 'blue sky',
    },
    bg2: {
      img: '/assets/backgrounds/cavern.png',
      title: 'cavern',
    },
    bg3: {
      img: '/assets/backgrounds/forest.png',
      title: 'forest',
    },
    bg4: {
      img: '/assets/backgrounds/magicalcave.png',
      title: 'magical cave',
    },
    bg5: {
      img: '/assets/backgrounds/shipwreck.png',
      title: 'shipwreck',
    },
    bg6: {
      img: '/assets/backgrounds/starryforest.png',
      title: 'starry forest',
    },
    bg7: {
      img: '/assets/backgrounds/starrysky.png',
      title: 'starry sky',
    },
    bg8: {
      img: '/assets/backgrounds/sunsetocean.png',
      title: 'sunset ocean',
    },
    bg9: {
      img: '/assets/backgrounds/treasurecave.png',
      title: 'treasure cave',
    },
    bg10: {
      img: '/assets/backgrounds/undersea.png',
      title: 'undersea',
    },
    bg11: {
      img: '/assets/backgrounds/water.png',
      title: 'water',
    },
  },
  sprites: {
    dude: {
      img: '/assets/sprites/dude.png',
      title: 'dude',
      width: 32,
      height: 48,
      frames: {
        left: [0, 3],
        turn: [4],
        right: [5, 8],
      },
    },
    pinkman: {
      img: '/assets/sprites/pinkman.png',
      title: 'pinkman',
      width: 32,
      height: 32,
      frames: {
        left: [0, 3],
        turn: [4],
        right: [5, 8],
      },
    },
    ninjafrog: {
      img: '/assets/sprites/ninjafrog.png',
      title: 'ninjafrog',
      width: 32,
      height: 32,
      frames: {
        left: [0, 3],
        turn: [4],
        right: [5, 8],
      },
    },
    virtualguy: {
      img: '/assets/sprites/virtualguy.png',
      title: 'virtualguy',
      width: 32,
      height: 32,
      frames: {
        left: [0, 3],
        turn: [4],
        right: [5, 8],
      },
    },
  },
  items: {
    star: {
      img: '/assets/items/star.png',
      title: 'star',
      width: 24,
      height: 22,
    },
    carrot: {
      img: '/assets/items/carrot.png',
      title: 'carrot',
      width: 24,
      height: 24,
    },
    money: {
      img: '/assets/items/money.png',
      title: 'money',
      width: 24,
      height: 24,
    },
    strawberry: {
      img: '/assets/items/strawberry.png',
      title: 'strawberry',
      width: 24,
      height: 24,
    },
    pumpkin: {
      img: '/assets/items/pumpkin.png',
      title: 'pumpkin',
      width: 24,
      height: 24,
    },
  },
  obstacles: {
    bomb: {
      img: '/assets/obstacles/bomb.png',
      title: 'bomb',
      width: 14,
      height: 14,
      physics: 'BOUNCE',
    },
    floatyalien: {
      img: '/assets/obstacles/floaty_alien.png',
      title: 'floatyalien',
      width: 50,
      height: 61,
      physics: 'FLOAT',
    },
    jellyfish: {
      img: '/assets/obstacles/jellyfish.png',
      title: 'jellyfish',
      width: 50,
      height: 67,
      physics: 'FLOAT',
    },
    fire: {
      img: '/assets/obstacles/fire.png',
      title: 'fire',
      width: 35,
      height: 40,
      physics: 'STATIC',
    },
  },
  platforms: {
    simple: {
      img: '/assets/platforms/simple_platform.png',
      title: 'simple',
    },
    dirt: {
      img: '/assets/platforms/dirt_platform.png',
      title: 'dirt',
    },
    green: {
      img: '/assets/platforms/green_platform.png',
      title: 'green',
    },
    ice: {
      img: '/assets/platforms/ice_platform.png',
      title: 'ice',
    },
    purple: {
      img: '/assets/platforms/purple_platform.png',
      title: 'purple',
    },
    red: {
      img: '/assets/platforms/red_platform.png',
      title: 'red',
    },
  },
  effects: {
    spotlight: {
      img: '/workshop/light.png',
      title: 'spotlight',
      file: '',
    },
  },
  audio: {
    bgm1: {
      img: '/workshop/halfnote.png',
      title: 'bgm1',
      file: '/assets/audio/BGM_01.wav',
    },
    bgm2: {
      img: '/workshop/quarternote.png',
      title: 'bgm2',
      file: '/assets/audio/BGM_02.wav',
    },
  },
};
