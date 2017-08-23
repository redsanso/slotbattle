import * as Phaser from 'phaser';
import { ListView } from 'phaser-list-view';
import { GameState } from './game.state';
import * as _ from 'lodash';

export class SlotsState implements GameState {
    game : Phaser.Game;
    key: string = "slots";

    coinHeight : number;
    coinSprites : Phaser.Image[] = [];

    slotCount : number = 5;
    slots : Phaser.Image[] = [];
    slotScrollers : ListView[] = [];
    slotButton : Phaser.Button;

    tweensToComplete : number = 0;

    /* Lifecycle events */

    preload = () => {
        this.game.load.image('slotbar', 'assets/png/Slotbar.png');
        this.coinSprites = [];
        for(let i = 0; i < 3; i++){
            this.coinSprites.push(this.game.load.image(`coin${i}`, `assets/png/coin${i}.png`));
        }
    }

    create = () => {
        let slotsSrc = this.game.cache.getImage('slotbar');
        let slotsStartX = this.game.world.width - (slotsSrc.width * this.slotCount) - 20; // margin
        let slotsStartY = Math.floor((this.game.world.height - slotsSrc.height) / 2);

        let coinSrc = this.game.cache.getImage('coin0');
        this.coinHeight = coinSrc.height;

        this.slots = [];
        for(var s = 0; s < this.slotCount; s++){
            this.slots.push(this.game.add.tileSprite(this.game.world.width, slotsStartY, slotsSrc.width, slotsSrc.height - this.coinHeight, 'slotbar'));
        }

        this.slots.forEach((slot : Phaser.Image, index : number) => {
            let slotTween = this.game.add.tween(slot)
                .to({ x : (slotsStartX + (100 * index)) }, 600, Phaser.Easing.Bounce.Out, true, 300 * index);
            slotTween.onComplete.add(() => {
                this.addPhaserListViewSlots((slotsStartX + (100 * index)), slotsStartY, slotsSrc.width, slotsSrc.height - this.coinHeight);
            }, this);
            slotTween.start(); 
        });

        this.slotButton = this.game.add.button(10, 10, 'lol', () => {
          this.runSlots();
        });
        this.slotButton.inputEnabled = true;
        this.tweensToComplete = 0;
    }

    render = () => {

    }

    shutdown = () => {

    }

    /* Utils */

    addPhaserListViewSlots(slotsStartX, slotsStartY, slotsWidth, slotsHeight){
        let scrollRectangle = new Phaser.Rectangle(slotsStartX, slotsStartY, slotsWidth, slotsHeight);
        let listView = new ListView(this.game, this.game.world, scrollRectangle, {
            direction : 'y',
            overflow : slotsHeight,
            padding : 0,
            autocull : false,
            snapping : true
        });
        listView.id = this.slotScrollers.length;
        listView.slotsHeight = slotsHeight;

        for(var y = -Math.floor(this.coinHeight / 2), i = 0; i < 100; y += this.coinHeight, i++){
            let randomCoin = Math.floor(Math.random() * this.coinSprites.length);
            let sprite = this.game.add.sprite(5, y, `coin${randomCoin}`);
            sprite.slotValue = randomCoin + 1;
            listView.add(sprite);
        }

        listView.scroller.events.onComplete.add(() => {
            let absPosition = Math.abs(listView.position) + this.coinHeight;
            let currentSprite = _.find(listView.items, (item) => item.position.y == absPosition);
            //console.log(`Slot ${listView.id} has value ${currentSprite.slotValue}`);
            this.tweensToComplete--;

            if(this.tweensToComplete == 0){
                this.slotButton.inputEnabled = true;
            }
        });

        this.slotScrollers.push(listView);
    }

    runSlots(){
        if(this.slotButton.inputEnabled && this.tweensToComplete == 0){
            this.tweensToComplete = this.slotScrollers.length;
            this.slotButton.inputEnabled = false;
            this.slotScrollers.forEach((listView : ListView, index : number) => {
                let target = Math.floor(Math.random() * (listView.length - listView.slotsHeight));
                target = listView.position;
                while(target == listView.position){
                  target = Math.floor(Math.random() * (listView.length - listView.slotsHeight));
                }
      
                if((target - Math.floor(this.coinHeight / 2)) % this.coinHeight > 0){
                    target -= target % this.coinHeight;
                }
      
                this.game.time.events.add((Phaser.Timer.SECOND * index / this.slotCount), () => {
                  listView.scroller.tweenTo(2 + (this.slotScrollers.length - index), -target);
                }, this);
            });
        }
    }
}
