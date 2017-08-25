import * as Phaser from 'phaser';
import { GameState } from "./game.state";

interface ParallaxLayer {
    src     : Phaser.Image;
    speed   ?: number;
    fixed   ?: boolean;
}

export class ParallaxState implements GameState {
    scale : number;
    key : string = "parallax";
    layers : ParallaxLayer[];
    bufferedLayers : ParallaxLayer[];
    game : Phaser.Game;
    subStates : { [key : string] : GameState };
    currentSubState : GameState;

    constructor(){
        this.layers = [];
        this.bufferedLayers = [];
    }

    setStates(states : { [key : string] : GameState }, startingState ?: string){
        this.subStates = states;
        this.currentSubState = (startingState) ? states[startingState] : states[Object.keys(states)[0]];
    }

    addLayer(key : string, index : number, speed : number){
        this.layers.splice(index, 0, {
            src : this.game.add.sprite(0, 0, key),
            speed : speed,
            fixed : (speed == 0)
        });

        this.bufferedLayers.splice(index, 0, {
            src : this.game.add.sprite(0, 0, key),
            speed : speed,
            fixed : (speed == 0)
        });
    }

    reloadCurrentSubState(){
        this.currentSubState.create();
    }

    switchState(key : string){
        this.currentSubState.shutdown();
        this.currentSubState = this.subStates[key];
        this.reloadCurrentSubState();
    }

    preload(){
        this.game.load.image('parallax-0', 'assets/parallax/parallax-mountain-bg.png');
        this.game.load.image('parallax-1', 'assets/parallax/parallax-mountain-montain-far.png');
        this.game.load.image('parallax-2', 'assets/parallax/parallax-mountain-mountains.png');
        this.game.load.image('parallax-3', 'assets/parallax/parallax-mountain-trees.png');
        this.game.load.image('parallax-4', 'assets/parallax/parallax-mountain-foreground-trees.png');

        Object.keys(this.subStates).forEach((key : string) => {
            let state : GameState = this.subStates[key];
            state.game = this.game;
            state.preload();
        });
    }

    create(){
        this.addLayer('parallax-0', 0, 0);
        this.addLayer('parallax-1', 1, -.4);
        this.addLayer('parallax-2', 2, -.8);
        this.addLayer('parallax-3', 3, -1.2);
        this.addLayer('parallax-4', 4, -1.6);
        this.currentSubState.create();
    }

    render(){
        this.layers.forEach((layer : ParallaxLayer, index : number) => {
            let ratio = this.game.world.height / layer.src.texture.height;
            layer.src.scale.setTo(ratio);
            let bufferedLayer = this.bufferedLayers[index];
            bufferedLayer.src.scale.setTo(ratio);

            if(bufferedLayer.src.position.x == layer.src.position.x)
                bufferedLayer.src.position.x += layer.src.texture.width * layer.src.scale.x;

            if(!layer.fixed){
                if(layer.src.position.x + (layer.src.texture.width * layer.src.scale.x) > 0){
                    layer.src.position.x += layer.speed;
                } else {
                    layer.src.position.setTo(bufferedLayer.src.position.x + (Math.floor((bufferedLayer.src.texture.width - 1.2) * bufferedLayer.src.scale.x)), 0);
                }

                if(bufferedLayer.src.position.x + (bufferedLayer.src.texture.width * bufferedLayer.src.scale.x) > 0){
                    bufferedLayer.src.position.x += bufferedLayer.speed;
                } else {
                    bufferedLayer.src.position.setTo(layer.src.position.x + (Math.floor((layer.src.texture.width - 1.2) * layer.src.scale.x)), 0);
                }
            }
        });

        this.currentSubState.render();
    }

    shutdown(){

    }
}
