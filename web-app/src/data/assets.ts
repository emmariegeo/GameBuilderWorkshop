interface Map {
    [key: string]: { [id: string]: { img: string, title: string, width?:number, height?:number, frames?: {}} }
}

export const data: Map = {
    backgrounds: {
        bg1: {
            "img": "assets/backgrounds/bluesky.png",
            "title": "blue sky"
        },
        bg2: {
            "img": "assets/backgrounds/cavern.png",
            "title": "cavern"
        },
        bg3: {
            "img": "assets/backgrounds/forest.png",
            "title": "forest"
        },
        bg4: {
            "img": "assets/backgrounds/magicalcave.png",
            "title": "magical cave"
        },
        bg5: {
            "img": "assets/backgrounds/shipwreck.png",
            "title": "shipwreck"
        },
        bg6: {
            "img": "assets/backgrounds/starryforest.png",
            "title": "starry forest"
        },
        bg7: {
            "img": "assets/backgrounds/starrysky.png",
            "title": "starry sky"
        },
        bg8: {
            "img": "assets/backgrounds/sunsetocean.png",
            "title": "sunset ocean"
        },
        bg9: {
            "img": "assets/backgrounds/treasurecave.png",
            "title": "treasure cave"
        },
        bg10: {
            "img": "assets/backgrounds/undersea.png",
            "title": "undersea"
        },
        bg11: {
            "img": "assets/backgrounds/water.png",
            "title": "water"
        },
    },
    sprites: {
        s1: {
            "img": "assets/sprites/dude.png",
            "title": "dude",
            "width": 32,
            "height": 48,
            "frames": {
                left: [0,3],
                turn: [4],
                right: [5,8]
            }
        },
        s2: {
            "img": "assets/sprites/pinkman.png",
            "title": "pinkman",
            "width": 32,
            "height": 32,
            "frames": {
                left: [0,3],
                turn: [4],
                right: [5,8]
            }
        }
    },
    items: {
        bg1: {
            "img": "assets/sprites/pinkman.png",
            "title": "pinkman"
        }
    },
    obstacles: {
        bg1: {
            "img": "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e",
            "title": "bg1"
        }
    },
    effects: {
        bg1: {
            "img": "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e",
            "title": "bg1"
        }
    },
    audio: {
        bg1: {
            "img": "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e",
            "title": "bg1"
        }
    }
}