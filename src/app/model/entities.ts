import * as Phaser from 'phaser';
import * as A from './custom-animation';

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

  constructor(maxHp: number, sprite: Phaser.Sprite, x : number, y : number, scale : number = 1, startAnimationName : string = 'idle') {
    this.maxHP = maxHp;
    this.currentHP = this.maxHP;
    this.sprite = sprite;
    this.animations = {
      spellcast: new A.CustomAnimationGroup("spellcast", 0, 0, 7, sprite),
      what: new A.CustomAnimationGroup("cmon", 4, 0, 8, sprite),
      walk: new A.CustomAnimationGroup("walk", 8, 0, 9, sprite),
      hail: new A.CustomAnimationGroup("hail", 12, 0, 6, sprite),
      idle: new A.CustomAnimationGroup("idle", 12, 0, 2, sprite),
      beforeAttack: new A.CustomAnimationGroup("beforeAttack", 16, 0, 9, sprite),
      attack: new A.CustomAnimationGroup("attack", 16, 9, 2, sprite),
      afterAttack: new A.CustomAnimationGroup("afterAttack", 16, 11, 1, sprite),
      die: new A.CustomAnimationFrames("die", 20, 0, 6, sprite),
      hit: new A.CustomAnimationFrames("hit", 20, 0, 4, sprite, true)
    };

    this.sprite.pivot.setTo(.5);
    this.sprite.scale.setTo(scale);
    this.sprite.position.setTo(x, y);

    this.idle();
  }

  // interfaces method implementations
  applyDamage = (damage: number) => {
    console.log('Hit for ' + damage + '!');
    this.currentHP -= damage;
  };
  isDead = () => {
    return this.currentHP <= 0;
  };
  destroy = () => {
    this.sprite.destroy();
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
    else
      console.log("No target to hit.");

    console.log(amount);
    return animation;
  };
  afterAttack = () => {
    return this.startAnimation('afterAttack', false);
  };

  changeDirection = (direction: direction, loop : boolean = true) => {
    this.direction = direction;
    this.startAnimation(this.currentAnimationName, loop);
  };
  startAnimation = (animationName: string, loop: boolean = true) => {
    let animation = this.animations[animationName];
    let directionAnimationName = (animation instanceof A.CustomAnimationGroup) ? `${animationName}_${this.direction}` : animationName;
    let frames = (animation instanceof A.CustomAnimationGroup) ? animation.getFramesCount(this.direction) : animation.getFramesCount();
    console.log(`currentAnimationName = ${this.currentAnimationName}`);
    this.currentAnimationName = animationName;
    return this.sprite.animations.play(directionAnimationName, frames, loop);
  };
  stopAnimation = (animationName ?: string) => {
    let name = animationName ? animationName : this.currentAnimationName;
    let animation = this.animations[name];
    let directionAnimationName = (animation instanceof A.CustomAnimationGroup) ? `${name}_${this.direction}` : name;
    console.log(`trying to stop ${directionAnimationName}`);
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
  constructor(maxHp: number, sprite: Phaser.Sprite, x : number, y : number, scale : number = 1, startAnimationName : string = 'idle') {
    super(maxHp, sprite, x, y, scale, startAnimationName);
    this.changeDirection('right', true);
  }
}

export class Orc extends Living {
  constructor(maxHp: number, sprite: Phaser.Sprite, x : number, y : number, scale : number = 1, startAnimationName : string = 'idle') {
    super(maxHp, sprite, x, y, scale, startAnimationName);
    // use spellcast animations for attack
    this.animations.attack = new A.CustomAnimationGroup("attack", 0, 0, 7, sprite);
    this.changeDirection('left', true);
  }
}
