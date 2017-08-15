import * as Phaser from 'phaser';

export interface GameState extends Phaser.State {
    game : Phaser.Game;
    key : string;
    preload : () => void;
    create : () => void;
    render : () => void;
}