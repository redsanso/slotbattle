import * as Phaser from 'phaser';
import { GameState } from './game.state';

export class SlotsState implements GameState {
    game : Phaser.Game;
    key: string = "slots";

    slots : Phaser.Image[] = [];

    preload = () => {
        this.game.load.image('slotbar', 'assets/png/Slotbar.png');
    }

    create = () => {
        let slotsSrc = this.game.cache.getImage('slotbar');
        let slotsStartX = this.game.world.width - (slotsSrc.width * 3) - 20; // margin
        let slotsStartY = Math.floor((this.game.world.height - slotsSrc.height) / 2);

        this.slots = [
            this.game.add.sprite(this.game.world.width, slotsStartY, 'slotbar'),
            this.game.add.sprite(this.game.world.width, slotsStartY, 'slotbar'),
            this.game.add.sprite(this.game.world.width, slotsStartY, 'slotbar')
        ];

        this.slots.forEach((slot : Phaser.Image, index : number) => {
            this.game.add
                .tween(slot)
                .to({ x : (slotsStartX + (100 * index)) }, 600, Phaser.Easing.Bounce.Out, true, 300 * index).start();
        });

    } 

    render = () => {
        
    } 

    shutdown = () => {
        
    }
} 