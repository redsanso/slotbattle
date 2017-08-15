import * as Phaser from 'phaser';
import { GameState } from './game.state';

export class TestState implements GameState {
    game : Phaser.Game;
    key: string = "TEST";

    sky : any;
    skyDirection : number = 0;

    preload = () => {
        this.game.world.setBounds(0, 0, 1280, 600);
        this.game.load.image('sky', 'assets/darkmoon.png');
    }

    create = () => {
        this.skyDirection = -1;
        this.sky = this.game.add.sprite(0, 0, 'sky');
    }

    render = () => {
        if(Math.abs(this.sky.position.x) >= this.sky.texture.width / 2)
            this.skyDirection = this.skyDirection * -1;

        this.sky.position.x += this.skyDirection;
    }
}