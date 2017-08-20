import * as Phaser from 'phaser';
import { GameState } from './game.state';

export class TestState implements GameState {
    game : Phaser.Game;
    key: string = "TEST";
    sky : any;

    preload = () => {
        this.game.world.setBounds(0, 0, 1280, 600);
        this.game.load.image('sky', 'assets/darkmoon.png');
    }

    create = () => {
        this.sky = this.game.add.sprite(0, 0, 'sky');
    }

    render = () => {
        
    }
}