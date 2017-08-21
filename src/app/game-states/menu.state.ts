import * as Phaser from 'phaser';
import { GameState } from './game.state';
import { ParallaxState } from './parallax.state';

export class MenuState implements GameState {
    game : Phaser.Game;
    key: string = "menu";

    logoSrc : any;
    logo : Phaser.Image;

    startButtonSrc : any;
    startButton : Phaser.Button;

    /* Phaser lifecycle */ 

    public preload = () => {
        this.game.load.image('logo', './assets/logo.png');        
        this.game.load.image('startButton', '/assets/png/StartButton.png');
    }

    public create = () => {
        this._createLogo();
        this._createMenuButtons(); 
    }
 
    public render = () => {
       
    }

    public shutdown = () => {
        let logoTween = this.game.add
            .tween(this.logo)
            .to({ alpha : 0, x : 10 }, 600, Phaser.Easing.Linear.None);
        
        let startButtonTween = this.game.add
            .tween(this.startButton)
            .to({ alpha : 0, x : 10 }, 600, Phaser.Easing.Linear.None);
        
        logoTween.start();
        startButtonTween.start();
    }

    /* Utility methods */

    private _createLogo(){
        this.logoSrc = this.game.cache.getImage('logo');
        this.logo = this.game.add.sprite(0, 0, 'logo');
        this.logo.position.x = this.game.world.width - (this.logoSrc.width * this.logo.scale.x);
        this.logo.position.y = (this.game.world.height * 1 / 4) - ((this.logoSrc.height * this.logo.scale.y) / 2);
    }

    private _createMenuButtons(){
        this.startButtonSrc = this.game.cache.getImage('startButton');
        this.startButton = this.game.add.button(0, this.game.world.height - 100, 'startButton');
        this.startButton.position.x = this.game.world.width - (this.startButtonSrc.width * this.startButton.scale.x) - 48;
        this.startButton.position.y = (this.game.world.height * 3 / 4) - ((this.startButtonSrc.height * this.startButton.scale.y) / 2);
        this.startButton.onInputUp.add(this.onStartButtonClick);
    }

    public onStartButtonClick : () => void = () => {};
    public onOptionButtonClick : () => void = () => {};
}