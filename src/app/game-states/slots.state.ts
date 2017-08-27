import * as Phaser from 'phaser';
import { ListView } from 'phaser-list-view';
import { GameState } from './game.state';
import { CustomAnimationGroup, CustomAnimationFrames } from "../model/custom-animation";
import { GROUND_LEVEL } from "./parallax.state";
import * as _ from 'lodash';
import { Human } from "../model/entities";

export class SlotsState implements GameState {
  game: Phaser.Game;
  key: string = "slots";

  coinHeight: number;
  coinSprites: Phaser.Image[] = [];

  slotCount: number = 5;
  slots: Phaser.Image[] = [];
  slotsGroup: Phaser.Group;
  slotScrollers: ListView[] = [];
  slotButton: Phaser.Button;
  backButton: Phaser.Button;

  tweensToComplete: number = 0;

  //player : Phaser.Sprite;
  player: Human;

  /* Lifecycle events */

  preload = () => {
    this.game.load.image('slotbar', 'assets/png/Slotbar.png');
    // http://gaurav.munjal.us/Universal-LPC-Spritesheet-Character-Generator/
    this.game.load.spritesheet('player', 'assets/spritesheet/player.png', 64, 64);
    this.game.load.image('attackButton', 'assets/png/AttackButton.png');
    this.game.load.image('backButton', 'assets/png/MainMenuButton.png');
    this.coinSprites = [];
    for (let i = 0; i < 7; i++) {
      this.coinSprites.push(this.game.load.image(`coin${i}`, `assets/png/coin${i}.png`));
    }
  };

  create = () => {
    // cached

    this.addBackButton();
    this.addSlots();
    this.addPlayer();
  };

  render = () => {

  };

  shutdown = () => {
    this.slotsGroup.destroy();
    this.slotsGroup = null;
    this.slotScrollers.forEach((scroller : ListView) => scroller.destroy());
    this.slots.forEach((slot : Phaser.Image) => slot.destroy());
    this.slotScrollers = [];
    this.slots = [];
    this.player.destroy();
    this.player = null;
    this.slotButton.destroy();
    this.slotButton = null;
    this.backButton.destroy();
    this.backButton = null;
  }; 

  /* Utils */

  addBackButton() {
    this.backButton = this.game.add.button(20, 20, 'backButton', () => {
      this.onBackButtonClick();
    });
  }

  addPlayer() {
    let player = this.game.add.sprite(this.game.world.width, this.game.world.height, 'player');
    let scale = 2;
    this.player = new Human(10, player, 120, (player.game.world.height - (GROUND_LEVEL * scale)), scale);
  }

  addSlots() {
    let slotsSrc = this.game.cache.getImage('slotbar');
    let coinSrc = this.game.cache.getImage('coin0');

    this.slotsGroup = this.game.add.group();
    //this.slotsGroup.position.setTo((this.game.world.width - (slotsSrc.width * this.slotCount)) / 2, 20);
    this.slotsGroup.position.setTo(20, 60);

    this.slotsGroup.width = slotsSrc.width * this.slotCount;
    this.slotsGroup.height = slotsSrc.height;
    this.coinHeight = coinSrc.height;

    this.slots = [];
    for (let s = 0; s < this.slotCount; s++) {
      let slotbar = this.game.add.tileSprite(this.game.world.width, 0, slotsSrc.width, slotsSrc.height - this.coinHeight, 'slotbar');
      this.slotsGroup.add(slotbar);
      this.slots.push(slotbar);
    }

    this.slots.forEach((slot: Phaser.Image, index: number) => {
      let slotTween = this.game.add.tween(slot)
        .to({ x: (100 * index) }, 600, Phaser.Easing.Bounce.Out, true, 300 * index);
      slotTween.onComplete.add(() => {
        this.addPhaserListViewSlots((this.slotsGroup.x + (100 * index)), this.slotsGroup.y, slotsSrc.width, slotsSrc.height - this.coinHeight);
      }, this);
      slotTween.start();
    });

    this.addSlotsButton();
  }

  addPhaserListViewSlots(slotsStartX, slotsStartY, slotsWidth, slotsHeight) {
    let scrollRectangle = new Phaser.Rectangle(slotsStartX, slotsStartY, slotsWidth, slotsHeight);
    let listView = new ListView(this.game, this.game.world, scrollRectangle, {
      direction: 'y',
      overflow: slotsHeight,
      padding: 0,
      autocull: false,
      snapping: true
    });
    listView.id = this.slotScrollers.length;
    listView.slotsHeight = slotsHeight;
    listView.slotValue = 0;

    for (let y = -Math.floor(this.coinHeight / 2), i = 0; i < 100; y += this.coinHeight, i++) {
      let randomCoin = Math.floor(Math.random() * this.coinSprites.length);
      let coinSprite = this.game.add.sprite(5, y, `coin${randomCoin}`);
      coinSprite.slotValue = randomCoin + 1;
      listView.add(coinSprite);
    }

    let onScrollComplete = () => {
      let absPosition = Math.abs(listView.position) + this.coinHeight;
      let currentSprite = _.find(listView.items, (item) => {
        return (item.position.y <= absPosition) && (item.position.y > absPosition - this.coinHeight);
      });
      listView.slotValue += currentSprite.slotValue;
      //console.log(`Slot ${listView.id} has value ${currentSprite.slotValue}`);
      this.tweensToComplete--;
      this.slotButton.enabled = false;

      if (this.tweensToComplete == 0) {
        this.performAttack();
        this.slotButton.enabled = true;
        this.slotButton.visible = true;
      }
    };

    listView.scroller.events.onComplete.add(onScrollComplete);

    this.slotScrollers.push(listView);
  }

  addSlotsButton() {
    let button = this.game.cache.getImage('attackButton');
    let buttonX = this.slotsGroup.position.x + (this.slotsGroup.width - button.width / 2);
    let buttonY = this.slotsGroup.height - button.height + 40;
    this.slotButton = this.game.add.button(buttonX, buttonY, 'attackButton', () => {
      this.runSlots();
    });
    this.slotsGroup.add(this.slotButton);
    this.slotButton.visible = true;
    this.tweensToComplete = 0;
  }

  runSlots() {
    if (this.slotButton.visible && this.tweensToComplete == 0) {
      this.tweensToComplete = this.slotScrollers.length;
      this.player.beforeAttack();
      this.slotButton.visible = false;
      this.slotScrollers.forEach((listView: ListView, index: number) => {
        listView.slotValue = 0;
        let target = Math.floor(Math.random() * (listView.length - listView.slotsHeight));
        target = listView.position;
        while (Math.abs(target - listView.position) < this.coinHeight * 6) {
          target = Math.floor(Math.random() * (listView.length - listView.slotsHeight));
        }

        if ((target - Math.floor(this.coinHeight / 2)) % this.coinHeight != 0) {
          target -= target % this.coinHeight;
        }

        this.game.time.events.add((Phaser.Timer.SECOND * index / this.slotCount), () => {
          listView.scroller.tweenTo(1.4, -target);
        }, this);
      });
    }
  }

  performAttack = () => {
    let damage = this.slotScrollers.reduce((accumulator: number, scroller: ListView) => {
      return accumulator + scroller.slotValue;
    }, 0);

    this.player.attack(damage, null).onComplete.addOnce(() => {
      console.log(`Total damage = ${damage}`);
      this.player.afterAttack().onComplete.addOnce(() => {
        this.player.idle();
      });
    });
  }

  // external hooks
  public onBackButtonClick: () => void = () => { };
}
