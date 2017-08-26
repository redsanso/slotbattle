import * as Phaser from 'phaser';
import { ListView } from 'phaser-list-view';
import { GameState } from './game.state';
import * as _ from 'lodash';


interface ICustomAnimationFrames {
  rowIndex : number;
  colIndex : number;
  frames   : number[];
}

class CustomAnimationFrames implements ICustomAnimationFrames {
  name : string;
  rowIndex : number;
  colIndex : number;
  frames   : number[];
  constructor(name : string, rowIndex : number, colIndex : number, frameCount : number, player : Phaser.Sprite){
    this.name = name;
    this.rowIndex = rowIndex;
    this.colIndex = colIndex;
    let startIndex = (rowIndex * 13 + colIndex);
    this.frames = _.range(startIndex, startIndex + frameCount);
    player.animations.add(this.name, this.frames);
  }
}

class CustomAnimationGroup {
  up : CustomAnimationFrames;
  left : CustomAnimationFrames;
  down : CustomAnimationFrames;
  right : CustomAnimationFrames;

  constructor(name : string, rowIndex : number, colIndex : number, frameCount : number, player : Phaser.Sprite){
    this.up = new CustomAnimationFrames(`${name}_up`, rowIndex, colIndex, frameCount, player);
    this.left = new CustomAnimationFrames(`${name}_left`, rowIndex + 1, colIndex, frameCount, player);
    this.down = new CustomAnimationFrames(`${name}_down`, rowIndex + 2, colIndex, frameCount, player);
    this.right = new CustomAnimationFrames(`${name}_right`, rowIndex + 3, colIndex, frameCount, player);
  }
}

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

  player : Phaser.Sprite;

  /* Lifecycle events */

  preload = () => {
    this.game.load.image('slotbar', 'assets/png/Slotbar.png');
    // http://gaurav.munjal.us/Universal-LPC-Spritesheet-Character-Generator/
    this.game.load.spritesheet('player', 'assets/spritesheet/player.png', 64, 64);
    this.coinSprites = [];
    for(let i = 0; i < 3; i++){
      this.coinSprites.push(this.game.load.image(`coin${i}`, `assets/png/coin${i}.png`));
    }
  };

  create = () => {
    // cached

    this.addSlots();
    this.addPlayer();
    this.addSlotsButton();
  };

  render = () => {

  };

  shutdown = () => {

  };

  /* Utils */

  addPlayer(){
    let player = this.game.add.sprite(this.game.world.width, this.game.world.height, 'player');
    player.pivot.setTo(.5);
    player.scale.setTo(2);
    player.position.setTo(120, (this.game.world.height - 200));

    let animations = {
      praise : new CustomAnimationGroup("praise", 0, 0, 7, player),
      what : new CustomAnimationGroup("cmon", 4, 0, 8, player),
      walk : new CustomAnimationGroup("walk", 8, 0, 9, player),
      hail : new CustomAnimationGroup("hail", 12, 0, 6, player),
      idle : new CustomAnimationGroup("idle", 12, 0, 2, player),
      attack : new CustomAnimationGroup("attack", 16, 0, 13, player),
      die : new CustomAnimationFrames("die", 20, 0, 6, player)
    };

    player.animations.play("idle_right", 4, true);
    this.player = player;
  }

  addSlots(){
    let slotsSrc = this.game.cache.getImage('slotbar');
    let coinSrc = this.game.cache.getImage('coin0');

    this.slotsGroup = this.game.add.group();
    this.slotsGroup.position.setTo((this.game.world.width - (slotsSrc.width * this.slotCount)) / 2, 20);

    this.slotsGroup.width = slotsSrc.width * this.slotCount;
    this.slotsGroup.height = slotsSrc.height;
    this.coinHeight = coinSrc.height;

    this.slots = [];
    for(let s = 0; s < this.slotCount; s++){
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
  }

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
    listView.slotValue = 0;

    for(let y = -Math.floor(this.coinHeight / 2), i = 0; i < 100; y += this.coinHeight, i++){
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
      listView.slotValue += currentSprite.slotValue;
      //console.log(`Slot ${listView.id} has value ${currentSprite.slotValue}`);
      this.tweensToComplete--;

      if(this.tweensToComplete == 0){
        this.performAttack();
        this.slotButton.visible = true;
      }
    });

    this.slotScrollers.push(listView);
  }

  addSlotsButton(){
    this.slotButton = this.game.add.button(10, 10, 'lol', () => {
      this.runSlots();
    });
    this.slotButton.visible = true;
    this.tweensToComplete = 0;
  }

  runSlots(){
    if(this.slotButton.visible && this.tweensToComplete == 0){
      this.tweensToComplete = this.slotScrollers.length;
      this.slotButton.visible = false;
      this.slotScrollers.forEach((listView : ListView, index : number) => {
        listView.slotValue = 0;
        let target = Math.floor(Math.random() * (listView.length - listView.slotsHeight));
        target = listView.position;
        while(Math.abs(target - listView.position) < this.coinHeight * 6){
          target = Math.floor(Math.random() * (listView.length - listView.slotsHeight));
        }

        if((target - Math.floor(this.coinHeight / 2)) % this.coinHeight > 0){
          target -= target % this.coinHeight;
        }

        this.game.time.events.add((Phaser.Timer.SECOND * index / this.slotCount), () => {
          listView.scroller.tweenTo(1.4, -target);
        }, this);
      });
    }
  }

  performAttack = () => {
    let damage = this.slotScrollers.reduce((accumulator : number, scroller : ListView) => {
      console.log(scroller);
      return accumulator + scroller.slotValue;
    }, 0);
    this.player.animations.play("attack_right", 13, false).onComplete.add(() => {
      console.log(`Total damage = ${damage}`);
      this.player.animations.play("idle_right", 4, true);
    });
  }
}
