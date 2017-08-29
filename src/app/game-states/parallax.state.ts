import * as Phaser from 'phaser';
import { GameState } from "./game.state";

interface ParallaxLayer {
    src: Phaser.Image;
    speed?: number;
    fixed?: boolean;
}

export const GROUND_LEVEL: number = 80;

export class ParallaxState implements GameState {
    scale: number;
    key: string = "parallax";
    layers: ParallaxLayer[];
    bufferedLayers: ParallaxLayer[];
    game: Phaser.Game;
    subStates: { [key: string]: GameState };
    currentSubState: GameState;

    music : Phaser.Audio;

    constructor() {
        this.layers = [];
        this.bufferedLayers = [];
    }

    setStates(states: { [key: string]: GameState }, startingState?: string) {
        this.subStates = states;
        this.currentSubState = (startingState) ? states[startingState] : states[Object.keys(states)[0]];
    }

    addLayer(key: string, index: number, speed: number) {
        let layerSrc = this.game.add.sprite(0, -GROUND_LEVEL, key);
        layerSrc.pivot.setTo(0);
        let bufferedLayerSrc = this.game.add.sprite(0, -GROUND_LEVEL, key);
        bufferedLayerSrc.pivot.setTo(0);

        this.layers.splice(index, 0, {
            src: layerSrc,
            speed: speed,
            fixed: (speed == 0)
        });

        this.bufferedLayers.splice(index, 0, {
            src: bufferedLayerSrc,
            speed: speed,
            fixed: (speed == 0)
        });
    }

    addGround() {
        let grassSrc = this.game.cache.getImage('grass');
        this.game.add.tileSprite(0, this.game.world.height - GROUND_LEVEL, this.game.world.width, grassSrc.height, 'grass');
    }

    reloadCurrentSubState() {
        this.currentSubState.create();
    }

    switchState(key: string) {
        this.currentSubState.shutdown();
        this.currentSubState = this.subStates[key];
        this.reloadCurrentSubState();
    }

    preload() {
        this.game.load.image('parallax-0', 'assets/parallax/parallax-mountain-bg.png');
        this.game.load.image('parallax-1', 'assets/parallax/parallax-mountain-montain-far.png');
        this.game.load.image('parallax-2', 'assets/parallax/parallax-mountain-mountains.png');
        this.game.load.image('parallax-3', 'assets/parallax/parallax-mountain-trees.png');
        this.game.load.image('parallax-4', 'assets/parallax/parallax-mountain-foreground-trees.png');
        this.game.load.image('grass', 'assets/parallax/grass-sepia-running-small.jpg');

        this.game.load.audio('music', 'assets/music/stone_fortress.ogg');

        Object.keys(this.subStates).forEach((key: string) => {
            let state: GameState = this.subStates[key];
            state.game = this.game;
            state.preload();
        });
    }

    create() {
        this.music = this.game.add.audio('music');
        this.music.volume = 3;
        this.music.play();

        this.addLayer('parallax-0', 0, 0);
        this.addLayer('parallax-1', 1, -.4);
        this.addLayer('parallax-2', 2, -.8);
        this.addLayer('parallax-3', 3, -1.2);
        this.addLayer('parallax-4', 4, -1.6);
        this.addGround();
        this.currentSubState.create();
    }

    render() {
        this.layers.forEach((layer: ParallaxLayer, index: number) => {
            let ratio = this.game.world.height / layer.src.texture.height;
            layer.src.scale.setTo(ratio);
            let bufferedLayer = this.bufferedLayers[index];
            bufferedLayer.src.scale.setTo(ratio);

            if (bufferedLayer.src.position.x == layer.src.position.x)
                bufferedLayer.src.position.x += layer.src.texture.width * layer.src.scale.x;

            if (!layer.fixed) {
                if (layer.src.position.x + (layer.src.texture.width * layer.src.scale.x) > 0) {
                    layer.src.position.x += layer.speed;
                } else {
                    layer.src.position.setTo(bufferedLayer.src.position.x + (Math.floor((bufferedLayer.src.texture.width - 1.2) * bufferedLayer.src.scale.x)), -GROUND_LEVEL);
                }

                if (bufferedLayer.src.position.x + (bufferedLayer.src.texture.width * bufferedLayer.src.scale.x) > 0) {
                    bufferedLayer.src.position.x += bufferedLayer.speed;
                } else {
                    bufferedLayer.src.position.setTo(layer.src.position.x + (Math.floor((layer.src.texture.width - 1.2) * layer.src.scale.x)), -GROUND_LEVEL);
                }
            }
        });

        this.currentSubState.render();
    }

    shutdown() {

    }
}
