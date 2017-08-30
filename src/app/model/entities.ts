import * as Phaser from 'phaser';
import * as A from './custom-animation';
import * as _ from 'lodash';

export interface ILiving {
  maxHP: number;
  currentHP: number;

  applyDamage: (damage: number) => void;
  isDead: () => boolean;
  destroy: () => void;
  hit :() => Phaser.Animation;
}

export interface IAttacker {
  attackModifier: number;
  beforeAttack: () => Phaser.Animation;
  attack: (damage: number, target: ILiving) => Phaser.Animation;
  afterAttack: () => Phaser.Animation;
  heal: (amount : number) => Phaser.Animation;
  die:() => Phaser.Animation;
}

export type direction = 'up' | 'left' | 'down' | 'right';
export interface IMobile {
  direction: direction;
  changeDirection: (direction: direction, loop: boolean) => void;
}

export interface IAnimable extends IMobile {
  sprite: Phaser.Sprite;
  animations: { [key: string]: A.CustomAnimationGroup };
  currentAnimationName : string;
  startAnimation: (animationName: string, loop: boolean) => Phaser.Animation;
  stopAnimation: (animationName: string) => Phaser.Animation;
  idle: () => void;
}

export class Living implements ILiving, IAttacker, IAnimable {
  attackModifier: number = 1;
  maxHP: number;
  currentHP: number;
  direction: direction = 'right';
  animations: A.CustomAnimationSet;
  currentAnimationName : string;
  sprite: Phaser.Sprite;

  healthBarGroup: Phaser.Group;
  healthBG : Phaser.Sprite;
  healthFG : Phaser.Sprite;

  static preload : (game : Phaser.Game) => void;
  static create : (game : Phaser.Game) => void;
  static render : (game : Phaser.Game) => void;

  constructor(game : Phaser.Game, maxHp: number, spriteName: string, x : number, y : number, scale : number = 1, startAnimationName : string = 'idle') {
    this.maxHP = maxHp;
    this.currentHP = this.maxHP;
    this.sprite = game.add.sprite(x, y, spriteName);
    
    let heal : Phaser.Sound = this.sprite.game.add.audio('heal');

    this.animations = {
      spellcast: new A.CustomAnimationGroup("spellcast", 0, 0, 7, this.sprite),
      heal: new A.CustomAnimationGroup("heal", 0, 0, 7, this.sprite, false, heal),
      what: new A.CustomAnimationGroup("cmon", 4, 0, 8, this.sprite),
      walk: new A.CustomAnimationGroup("walk", 8, 0, 9, this.sprite),
      hail: new A.CustomAnimationGroup("hail", 12, 0, 6, this.sprite),
      idle: new A.CustomAnimationGroup("idle", 12, 0, 2, this.sprite),
      beforeAttack: new A.CustomAnimationGroup("beforeAttack", 16, 0, 9, this.sprite),
      attack: new A.CustomAnimationGroup("attack", 16, 9, 2, this.sprite),
      afterAttack: new A.CustomAnimationGroup("afterAttack", 16, 11, 1, this.sprite),
      die: new A.CustomAnimationFrames("die", 20, 0, 6, this.sprite),
      hit: new A.CustomAnimationFrames("hit", 20, 0, 4, this.sprite, true)
    };

    // Sprite pivot is set to center
    this.sprite.anchor.setTo(.5);
    this.sprite.scale.setTo(scale);
    this.sprite.position.setTo(x, y);

    this._createHealthBar();

    this.idle();
  }

  // utils

  _createHealthBar(){
    this.healthBarGroup = this.sprite.game.add.group();
    let HB_WIDTH = 128;
    let HB_HEIGHT = 24;
    let HB_X = this.sprite.position.x - (HB_WIDTH / 2);
    let HB_Y = this.sprite.position.y - (this.sprite.height * 2 / 3);
    this.healthBarGroup.position.setTo(HB_X, HB_Y);

    let healthBGBitmap = this._getHealthBarLayer('#000000', HB_WIDTH, HB_HEIGHT);
    this.healthBG = this.sprite.game.add.sprite(0, 0, healthBGBitmap);
    this.healthBarGroup.add(this.healthBG);

    let healthFGBitmap = this._getHealthBarLayer('#ff0000', HB_WIDTH, HB_HEIGHT, 2);
    this.healthFG = this.sprite.game.add.sprite(0, 0, healthFGBitmap);
    this.healthBarGroup.add(this.healthFG);
  }

  _getHealthBarLayer(color : string, width : number, height : number, margin : number = 0){
    let bitmapData : Phaser.BitmapData = this.sprite.game.add.bitmapData(width, height);
    bitmapData.ctx.beginPath();
    bitmapData.ctx.rect(margin, margin, width - (margin * 2), height - (margin * 2));
    bitmapData.ctx.fillStyle = color;
    bitmapData.ctx.fill();
    return bitmapData;
  }

  _createDamageBubble(damage : number){
    let damageTextStyle = { font : '12px Courier', stroke : '#000000', strokeThickness : 10, fill : 'yellow', fontWeight : 'bold' };
    let damageText = this.sprite.game.add.text(this.sprite.position.x, this.sprite.position.y, `${damage}`, damageTextStyle);
    damageText.anchor.setTo(.5);
    let damageTextTween = this.sprite.game.add.tween(damageText).to({ y : this.sprite.position.y - 300, alpha : 0, fontSize : 48 }, 4000, Phaser.Easing.Exponential.Out, true);
    damageTextTween.onComplete.addOnce(() => {
      damageText.destroy();
    });
    damageTextTween.start();
  }

  _createHealBubble(amount : number){
    let damageTextStyle = { font : '12px Courier', stroke : '#000000', strokeThickness : 10, fill : 'green', fontWeight : 'bold' };
    let damageText = this.sprite.game.add.text(this.sprite.position.x, this.sprite.position.y, `${amount}`, damageTextStyle);
    damageText.anchor.setTo(.5);
    let damageTextTween = this.sprite.game.add.tween(damageText).to({ y : this.sprite.position.y - 300, alpha : 0, fontSize : 48 }, 4000, Phaser.Easing.Exponential.Out, true);
    damageTextTween.onComplete.addOnce(() => {
      damageText.destroy();
    });
    damageTextTween.start();
  }

  _updateHealthBar(){
    this.healthFG.scale.setTo((this.currentHP / this.maxHP), 1);
  }

  // interfaces method implementations
  applyDamage = (damage: number) => {
    this._createDamageBubble(damage);

    if(this.currentHP - damage > 0){
      this.currentHP -= damage;
    } else {
      this.currentHP = 0;
      this.die();
    }

    this._updateHealthBar();
  };
  isDead = () => {
    return this.currentHP <= 0;
  };
  destroy = () => {
    this.sprite.destroy();
    this.healthBarGroup.destroy();
  };
  hit = () => {
    return this.startAnimation('hit', false);
  };

  beforeAttack = () => {
    return this.startAnimation('beforeAttack', false);
  };
  attack = (damage: number, target: ILiving) => {
    let animation = this.startAnimation('attack', false);
    let amount = damage * this.attackModifier;

    if(target != null)
      target.applyDamage(amount);

    return animation;
  };
  afterAttack = () => {
    return this.startAnimation('afterAttack', false);
  };
  heal = (amount : number) => {
    this._createHealBubble(amount);

    if(this.currentHP + amount > this.maxHP){
      this.currentHP = this.maxHP;
    } else {
      this.currentHP += amount;
    }

    this.startAnimation('heal', false);
    this._updateHealthBar();
  };
  randomHeal = () => {
    let healableAmount = this.maxHP - this.currentHP;
    if(healableAmount > 0){
      this.heal(Math.ceil(Math.random() * healableAmount));
    }
  };

  changeDirection = (direction: direction, loop : boolean = true) => {
    this.direction = direction;
    this.startAnimation(this.currentAnimationName, loop);
  };
  startAnimation = (animationName: string, loop: boolean = true) => {
    let animation = this.animations[animationName];
    let directionAnimationName = (animation instanceof A.CustomAnimationGroup) ? `${animationName}_${this.direction}` : animationName;
    let frames = (animation instanceof A.CustomAnimationGroup) ? animation.getFramesCount(this.direction) : animation.getFramesCount();
    this.currentAnimationName = animationName;
    return this.sprite.animations.play(directionAnimationName, frames, loop);
  };
  stopAnimation = (animationName ?: string) => {
    let name = animationName ? animationName : this.currentAnimationName;
    let animation = this.animations[name];
    let directionAnimationName = (animation instanceof A.CustomAnimationGroup) ? `${name}_${this.direction}` : name;
    this.sprite.animations.stop(directionAnimationName);
  };
  idle = () => {
    this.startAnimation('idle', true);
  };
  die = () => {
    return this.startAnimation('die', false);
  };
}

export class Human extends Living {
  static preload = (game : Phaser.Game) => {
    game.load.spritesheet('player', 'assets/spritesheet/player.png', 64, 64);
    game.load.audio('heal', 'assets/sounds/shimmer_1.flac');
    game.load.audio('explosion', 'assets/sounds/explosion.mp3');
    game.load.audio('arrow_shoot', 'assets/sounds/arrow_shoot.mp3');
  };

  constructor(game : Phaser.Game, maxHp: number, x : number, y : number, scale : number = 1, startAnimationName : string = 'idle') {
    super(game, maxHp, 'player', x, y, scale, startAnimationName);
    let explosion : Phaser.Sound = this.sprite.game.add.audio('explosion');
    let arrowShoot : Phaser.Sound = this.sprite.game.add.audio('arrow_shoot');
    this.animations.attack = new A.CustomAnimationGroup("attack", 16, 9, 2, this.sprite, false, arrowShoot);
    this.animations.hit = new A.CustomAnimationFrames("hit", 20, 0, 4, this.sprite, true, explosion);
    this.changeDirection('right', true);
  }
}

export class Orc extends Living {
  static preload = (game : Phaser.Game) => {
    game.load.spritesheet('orc', 'assets/spritesheet/orc.png', 64, 64);
    game.load.spritesheet('boom', 'assets/spritesheet/Explosion.png', 96, 96);
    game.load.audio('arrow_hit', 'assets/sounds/arrow_hit.mp3');
  };

  constructor(game : Phaser.Game, maxHp: number, x : number, y : number, scale : number = 1, startAnimationName : string = 'idle') {
    super(game, maxHp, 'orc', x, y, scale, startAnimationName);
    // use spellcast animations for attack
    let arrowHit : Phaser.Sound = this.sprite.game.add.audio('arrow_hit');
    this.animations.attack = new A.CustomAnimationGroup("attack", 0, 0, 7, this.sprite);
    this.animations.hit = new A.CustomAnimationFrames("hit", 20, 0, 4, this.sprite, true, arrowHit);
    this.changeDirection('left', true);
  }

  explosionAttack = (damage : number, target : Living) => {
    let attack = this.attack(damage, target);
    attack.onComplete.addOnce(() => {
      let boom = this.sprite.game.add.sprite(target.sprite.position.x, target.sprite.position.y, 'boom');
      boom.anchor.setTo(.5);
      boom.animations.add('boom', _.range(0, 12));
      let boomAnimation = boom.animations.getAnimation('boom');
      boomAnimation.onComplete.addOnce(() => {
        boom.destroy();
      });
      boomAnimation.play();
    });
    return attack;
  };
}
