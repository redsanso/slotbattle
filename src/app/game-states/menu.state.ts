import * as Phaser from 'phaser';
import { GameState } from './game.state';

interface ParallaxLayer {
    src     : Phaser.Image;
    speed   ?: number;
    fixed   ?: boolean;
}

class ParallaxState implements Phaser.State {
    scale : number;
    layers : ParallaxLayer[];
    bufferedLayers : ParallaxLayer[];
    game : Phaser.Game;

    constructor(game : Phaser.Game){
        this.layers = [];
        this.bufferedLayers = [];
        this.game = game;
    }

    add(key : string, index : number, speed : number){
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
    }
}

export class MenuState implements GameState {
    game : Phaser.Game;
    key: string = "TEST";
    subParallaxState : ParallaxState;

    startButtonSrc : any;

    startButton : Phaser.Button;

    preload = () => {
        //this.game.world.setBounds(0, 0, 1280, 600);
        this.game.load.image('sky', 'assets/png/darkmoon.png');
        this.game.load.image('startButton', '/assets/png/StartButton.png');

        this.game.load.image('parallax-0', 'assets/parallax/parallax-mountain-bg.png');
        this.game.load.image('parallax-1', 'assets/parallax/parallax-mountain-montain-far.png');
        this.game.load.image('parallax-2', 'assets/parallax/parallax-mountain-mountains.png');
        this.game.load.image('parallax-3', 'assets/parallax/parallax-mountain-trees.png');
        this.game.load.image('parallax-4', 'assets/parallax/parallax-mountain-foreground-trees.png');
    }

    create = () => {
        this.createParallax();

        this.startButtonSrc = this.game.cache.getImage('startButton');

        this.startButton = this.game.add.button(
            0,
            this.game.world.height - 100,
            'startButton');
        
        this.startButton.position.x = this.game.world.centerX - ((this.startButtonSrc.width * this.startButton.scale.x) / 2);
        this.startButton.position.y = (this.game.world.height * 3 / 4) - ((this.startButtonSrc.height * this.startButton.scale.y) / 2);
        this.startButton.onInputUp.add(this.onStartButtonClick);
    }

    render = () => {
        this.subParallaxState.render();
    }

    createParallax(){
        this.subParallaxState = new ParallaxState(this.game);
        this.subParallaxState.add('parallax-0', 0, 0);
        this.subParallaxState.add('parallax-1', 1, -2);
        this.subParallaxState.add('parallax-2', 2, -4);
        this.subParallaxState.add('parallax-3', 3, -5);
        this.subParallaxState.add('parallax-4', 4, -7);
    }

    onStartButtonClick(){
        
    }
}