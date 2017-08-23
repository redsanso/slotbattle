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
    slotsGroup : Phaser.Group;
    slotScrollers : ListView[] = [];
    slotButton : Phaser.Button;

    tweensToComplete : number = 0;

    /* Lifecycle events */

    preload = () => {
        this.game.load.image('slotbar', 'assets/png/Slotbar.png');
        this.game.load.spritesheet('player', 'assets/spritesheet/player.png', 64, 64);
        this.coinSprites = [];
        for(let i = 0; i < 3; i++){
            this.coinSprites.push(this.game.load.image(`coin${i}`, `assets/png/coin${i}.png`));
        }
    }

    create = () => {
        // cached
        let slotsSrc = this.game.cache.getImage('slotbar');
        let coinSrc = this.game.cache.getImage('coin0');

        let playerSrc = this.game.cache.getImage('player');
        let player = this.game.add.sprite(120, this.game.world.height - 64, 'player');
        player.animations.add('run');
        player.animations.play('run', 10, true);

        this.slotsGroup = this.game.add.group();
        this.slotsGroup.position.setTo((this.game.world.width - (slotsSrc.width * this.slotCount)) / 2, 20);

        this.slotsGroup.width = slotsSrc.width * this.slotCount;
        this.slotsGroup.height = slotsSrc.height;
        this.coinHeight = coinSrc.height;

        this.slots = [];
        for(var s = 0; s < this.slotCount; s++){
            let slotbar = this.game.add.tileSprite(this.game.world.width, 0, slotsSrc.width, slotsSrc.height - this.coinHeight, 'slotbar');
            this.slotsGroup.add(slotbar);
            this.slots.push(slotbar);
        }

        this.slots.forEach((slot : Phaser.Image, index : number) => {
            let slotTween = this.game.add.tween(slot)
                .to({ x : (100 * index) }, 600, Phaser.Easing.Bounce.Out, true, 300 * index);
            slotTween.onComplete.add(() => {
                this.addPhaserListViewSlots((this.slotsGroup.x + (100 * index)), this.slotsGroup.y, slotsSrc.width, slotsSrc.height - this.coinHeight);
            }, this);
            slotTween.start();
        });



        this.slotButton = this.game.add.button(10, 10, 'lol', () => {
          this.runSlots();
        });
        this.slotButton.visible = true;
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
            let coinSprite = this.game.add.sprite(5, y, `coin${randomCoin}`);
            coinSprite.slotValue = randomCoin + 1;
            listView.add(coinSprite);
        }

        listView.scroller.events.onComplete.add(() => {
            let absPosition = Math.abs(listView.position) + this.coinHeight;
            let currentSprite = _.find(listView.items, (item) => {
              return (item.position.y <= absPosition) && (item.position.y > absPosition - this.coinHeight);
            });
            //console.log(`Slot ${listView.id} has value ${currentSprite.slotValue}`);
            this.tweensToComplete--;

            if(this.tweensToComplete == 0){
                this.slotButton.visible = true;
            }
        });

        this.slotScrollers.push(listView);
    }

    runSlots(){
        if(this.slotButton.visible && this.tweensToComplete == 0){
            this.tweensToComplete = this.slotScrollers.length;
            this.slotButton.visible = false;
            this.slotScrollers.forEach((listView : ListView, index : number) => {
                let target = Math.floor(Math.random() * (listView.length - listView.slotsHeight));
                target = listView.position;
                while(Math.abs(target - listView.position) < this.coinHeight * 3){
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
