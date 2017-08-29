import * as Phaser from 'phaser';
import { ListView } from 'phaser-list-view';
import { GameState } from './game.state';
import { CustomAnimationGroup, CustomAnimationFrames } from "../model/custom-animation";
import { GROUND_LEVEL } from "./parallax.state";
import * as _ from 'lodash';
import { Human, Orc, Living } from "../model/entities";

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
  nextEnemyButton: Phaser.Button;
  lastEvent: string;
  log: Phaser.Sprite;
  logListView : ListView;
  lastEventMessage: Phaser.Text;

  tweensToComplete: number = 0;

  //player : Phaser.Sprite;
  player: Human;
  enemy: Orc;

  PLAYER_MARGIN_OFFSET: number = 120;

  /* Lifecycle events */

  preload = () => {
    this.game.load.bitmapFont
    this.game.load.image('slotbar', 'assets/png/Slotbar.png');
    // http://gaurav.munjal.us/Universal-LPC-Spritesheet-Character-Generator/
    this.game.load.spritesheet('player', 'assets/spritesheet/player.png', 64, 64);
    this.game.load.spritesheet('orc', 'assets/spritesheet/orc.png', 64, 64);
    this.game.load.image('attackButton', 'assets/png/AttackButton.png');
    this.game.load.image('backButton', 'assets/png/MainMenuButton.png');
    this.game.load.image('nextEnemyButton', 'assets/png/NextEnemyButton.png');
    this.coinSprites = [];
    for (let i = 0; i < 7; i++) {
      this.coinSprites.push(this.game.load.image(`coin${i}`, `assets/png/coin${i}.png`));
    }
  };

  create = () => {
    // cached
    this.addSlots();
    this.addLog();
    this.addPlayer();
    this.addEnemy();
  };

  render = () => {

  };

  shutdown = () => {
    this.slotsGroup.destroy();
    this.slotsGroup = null;
    this.slotScrollers.forEach((scroller: ListView) => scroller.destroy());
    this.slots.forEach((slot: Phaser.Image) => slot.destroy());
    this.slotScrollers = [];
    this.slots = [];
    this.player.destroy();
    this.player = null;
    this.enemy.destroy();
    this.enemy = null;
    this.slotButton.destroy();
    this.slotButton = null;
    this.backButton.destroy();
    this.backButton = null;
    this.log.destroy();
    this.log = null;
    this.logListView.destroy();
    this.logListView = null;
    if (this.nextEnemyButton) {
      this.nextEnemyButton.destroy();
      this.nextEnemyButton = null;
    }
  };

  /* Utils */

  addBackButton() {
    this.backButton = this.game.add.button(20, 10, 'backButton', () => {
      this.onBackButtonClick();
    });
  }

  addNextEnemyButton() {
    let buttonSrc = this.game.cache.getImage('nextEnemyButton');
    let buttonX = this.enemy.sprite.position.x - (buttonSrc.width / 2);
    let buttonY = this.enemy.sprite.position.y - (this.enemy.sprite.height * 2 / 3) - (buttonSrc.height / 4);
    this.nextEnemyButton = this.game.add.button(buttonX, buttonY, 'nextEnemyButton', () => {
      this.nextEnemyButton.destroy();
      this.nextEnemyButton = null;
      this.enemy.destroy();
      this.addEnemy();
      this.slotButton.enabled = true;
      this.slotButton.visible = true;
    });
  }

  addPlayer() {
    let player = this.game.add.sprite(this.game.world.width, this.game.world.height, 'player');
    let scale = 2;
    this.player = new Human(100, player, this.PLAYER_MARGIN_OFFSET, (player.game.world.height - GROUND_LEVEL), scale, 'idle');
    this.addEventMessage('white', `An Human joined the match.`);
  }

  addEnemy() {
    let enemy = this.game.add.sprite(this.game.world.width, this.game.world.height, 'orc');
    let scale = 2;
    this.enemy = new Orc(100, enemy, this.game.world.width - this.PLAYER_MARGIN_OFFSET, (enemy.game.world.height - GROUND_LEVEL), scale, 'idle');
    this.addEventMessage('white', `An Orc joined the match.`);
  }

  addLog(){
    let slotsSrc = this.game.cache.getImage('slotbar');
    let coinSrc = this.game.cache.getImage('coin0');
    let logX = this.game.world.width - (slotsSrc.width * 5) - 20;
    let logY = 60;
    let logW = slotsSrc.width * 5;
    let logH = slotsSrc.height - coinSrc.height;
    let logBitmap = this.game.add.bitmapData(logW, logH);
    logBitmap.ctx.beginPath();
    logBitmap.ctx.rect(0, 0, logW, logH);
    logBitmap.ctx.fillStyle = '#000000';
    logBitmap.ctx.globalAlpha = .5;
    logBitmap.ctx.fill();
    this.log = this.game.add.sprite(logX, logY, logBitmap);

    let logListRectangle = new Phaser.Rectangle(this.log.position.x, this.log.position.y, this.log.width, this.log.height);
    this.logListView = new ListView(this.game, this.game.world, logListRectangle, {
      direction: 'y',
      overflow: logH,
      padding: 0,
      autocull: false,
      snapping: true
    });
  }

  addEventMessage(fill : string, message : string) {
    let lastEventMessageStyle = { font: '16px Arial Black', fill : fill, strokeThickness : 2, stroke : '#000000' };
    this.lastEventMessage = this.game.add.text(0, 0, message, lastEventMessageStyle);
    this.logListView.add(this.lastEventMessage);
    this.logListView.scroller.tweenTo(1.4, -this.logListView.scroller.length);
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
        if (index == this.slots.length - 1) {
          this.addBackButton();
          this.addSlotsButton();
        }
      }, this);
      slotTween.start();
    });
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
        this.performPlayerAttack();
      }
    };

    listView.scroller.events.onComplete.add(onScrollComplete);

    this.slotScrollers.push(listView);
  }

  addSlotsButton() {
    let button = this.game.cache.getImage('attackButton');
    let buttonX = (this.slotsGroup.width - button.width) / 2;
    let buttonY = this.slotsGroup.height - button.height + 60;
    this.slotButton = this.game.add.button(buttonX, buttonY, 'attackButton', () => {
      this.runSlots();
    });
    this.slotsGroup.add(this.slotButton);
    this.slotButton.visible = true;
    this.tweensToComplete = 0;
  }

  runSlots() {
    if (this.slotButton.visible && this.tweensToComplete == 0) {
      this.enemy.stopAnimation();
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

  getTotalSlotPoints(){
    return this.slotScrollers.reduce((accumulator: number, scroller: ListView) => {
      return accumulator + scroller.slotValue;
    }, 0);
  }

  performPlayerAttack = () => {
    let damage = this.getTotalSlotPoints();

    this.player.attack(damage, this.enemy).onComplete.addOnce(() => {
      this.addEventMessage('yellow', `Player hits enemy for ${damage * this.player.attackModifier} damage`);
      if (this.enemy.isDead()) {
        this.randomHealPlayer();
        this.killEnemy();
      } else {
        this.performEnemyCounterattack();
      }

      this.player.afterAttack().onComplete.addOnce(() => {
        this.player.idle();
      });
    });
  };

  performEnemyCounterattack(){
    this.enemy.hit().onComplete.addOnce(() => {
      let enemyDamage = Math.ceil(Math.random() * 20);
      this.enemy.attack(enemyDamage, this.player).onComplete.addOnce(() => {
        this.addEventMessage('red', `Enemy hits player for ${enemyDamage * this.enemy.attackModifier} damage.`);
        if (this.player.isDead()) {
          this.killPlayer();
        } else {
          this.hitPlayer(enemyDamage);
        }
      });
    });
  }

  randomHealPlayer(){
    let previousHP = this.player.currentHP;
    this.player.randomHeal();
    let updatedHP = this.player.currentHP;
    this.addEventMessage('green', `Player heals ${updatedHP - previousHP} HP!`);
  }

  hitPlayer(enemyDamage : number){
    this.player.hit().onComplete.addOnce(() => {
      this.player.idle();
      this.slotButton.enabled = true;
      this.slotButton.visible = true;
    });
  }

  killPlayer(){
    this.addEventMessage('red', `Player is dead :(`);
    this.player.die().onComplete.addOnce(() => {
      this.onBackButtonClick();
    });
  }

  killEnemy(){
    this.enemy.die().onComplete.addOnce(() => {
      this.addEventMessage('green', `Enemy is dead!\n`);
      this.addNextEnemyButton();
    });
  }

  // external hooks
  public onBackButtonClick: () => void = () => { };
}
