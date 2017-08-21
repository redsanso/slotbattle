import * as Phaser from 'phaser';
import {ListView} from 'phaser-list-view';
import { GameState } from './game.state';

export class SlotsState implements GameState {
    game : Phaser.Game;
    key: string = "slots";

    slots : Phaser.Image[] = [];
    slotScrollers : ListView[] = [];

    preload = () => {
        this.game.load.image('slotbar', 'assets/png/Slotbar.png');
        this.game.load.image('coin', 'assets/png/test-coin.png');
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
            let slotTween = this.game.add.tween(slot)
                .to({ x : (slotsStartX + (100 * index)) }, 600, Phaser.Easing.Bounce.Out, true, 300 * index);
            slotTween.onComplete.add(() => {
                let scrollRectangle = new Phaser.Rectangle((slotsStartX + (100 * index)), slotsStartY, slotsSrc.width, slotsSrc.height);
                let listView = new ListView(this.game, this.game.world, scrollRectangle, {
                    direction : 'y'
                });

                listView.add(this.game.add.sprite(0, scrollRectangle.y - 45, 'coin'));
                listView.add(this.game.add.sprite(0, scrollRectangle.y + 45, 'coin'));
                listView.add(this.game.add.sprite(0, scrollRectangle.y + 135, 'coin'));
                listView.add(this.game.add.sprite(0, scrollRectangle.y + 225, 'coin'));
                
                this.slotScrollers.push(listView);
            }, this);
            slotTween.start();
        });

    } 

    render = () => {
        
    } 

    shutdown = () => {
        
    }
} 