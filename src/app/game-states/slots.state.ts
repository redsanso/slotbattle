import * as Phaser from 'phaser';
import { ListView } from 'phaser-list-view';
import { GameState } from './game.state';

export class SlotsState implements GameState {
    game : Phaser.Game;
    key: string = "slots";

    slots : Phaser.Image[] = [];
    slotScrollers : ListView[] = [];

    /* Lifecycle events */

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
                    direction : 'y',
                    overflow : 360,
                    padding : 10
                });

                listView.add(this.game.add.sprite(5, scrollRectangle.y - 45, 'coin'));
                listView.add(this.game.add.sprite(5, scrollRectangle.y + 45, 'coin'));
                listView.add(this.game.add.sprite(5, scrollRectangle.y + 135, 'coin'));
                listView.add(this.game.add.sprite(5, scrollRectangle.y + 225, 'coin'));

                listView.scroller.events.onUpdate.add((o) => {
                  console.log(o);
                });

                this.slotScrollers.push(listView);
            }, this);
            slotTween.start();
        });

        this.game.add.button(10, 10, null, () => {
          this.runSlots();
        });

    }

    render = () => {

    }

    shutdown = () => {

    }

    /* Utils */

    runSlots(){
      this.slotScrollers.forEach((listView : ListView) => {
        listView.scroller.events.onInputDown.dispatch();
        listView.scroller.events.onInputMove.dispatch({ total : Math.floor(Math.random() * 1000) });
      });
    }
}
