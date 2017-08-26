import * as Phaser from 'phaser';
import * as A from './custom-animation';

export interface ILiving {
    maxHP: number;
    currentHP: number;

    applyDamage: (damage: number) => void;
    isDead: () => boolean;
}

export interface IAttacker {
    attackModifier: number;
    beforeAttack: () => Phaser.Animation;
    attack: (damage: number, target: ILiving) => Phaser.Animation;
    afterAttack: () => Phaser.Animation;
}

export type direction = 'up' | 'left' | 'down' | 'right';
export interface IMobile {
    direction: direction;
    changeDirection: (direction: direction) => void;
}

export interface IAnimable extends IMobile {
    sprite: Phaser.Sprite;
    animations: { [key: string]: A.CustomAnimationGroup };
    startAnimation: (animationName: string, speed: number, loop: boolean) => Phaser.Animation;
    idle: () => void;
}

export class Human implements ILiving, IAttacker, IAnimable {
    attackModifier: number = 1;
    maxHP: number;
    currentHP: number;
    direction: direction = 'right';
    animations: A.CustomAnimationSet;
    sprite: Phaser.Sprite;

    constructor(maxHp: number, sprite: Phaser.Sprite, x : number, y : number, scale : number = 1) {
        this.maxHP = maxHp;
        this.currentHP = this.maxHP;
        this.sprite = sprite;
        this.animations = {
            praise: new A.CustomAnimationGroup("praise", 0, 0, 7, sprite),
            what: new A.CustomAnimationGroup("cmon", 4, 0, 8, sprite),
            walk: new A.CustomAnimationGroup("walk", 8, 0, 9, sprite),
            hail: new A.CustomAnimationGroup("hail", 12, 0, 6, sprite),
            idle: new A.CustomAnimationGroup("idle", 12, 0, 2, sprite),
            beforeAttack: new A.CustomAnimationGroup("beforeAttack", 16, 0, 9, sprite),
            attack: new A.CustomAnimationGroup("attack", 16, 9, 2, sprite),
            afterAttack: new A.CustomAnimationGroup("afterAttack", 16, 11, 1, sprite),
            die: new A.CustomAnimationFrames("die", 20, 0, 6, sprite)
        };
        
        this.sprite.pivot.setTo(.5);
        this.sprite.scale.setTo(scale);
        this.sprite.position.setTo(x, y);

        this.idle();
    }

    // interfaces method implementations
    applyDamage = (damage: number) => {
        this.currentHP -= damage;
    };
    isDead = () => {
        return this.currentHP <= 0;
    };

    beforeAttack = () => {
        return this.startAnimation('beforeAttack', 9, false);
    };
    attack = (damage: number, target: ILiving) => {
        let animation = this.startAnimation('attack', 9, false);
        let amount = damage * this.attackModifier;

        if(target != null)
            target.applyDamage(amount);
        else 
            console.log("No target to hit.");

        console.log(amount);
        return animation;
    };
    afterAttack = () => {
        return this.startAnimation('afterAttack', 1, false);
    };

    changeDirection = (direction: direction) => {
        this.direction = direction;
    };
    startAnimation = (animationName: string, speed: number, loop: boolean = true) => {
        return this.sprite.animations.play(`${animationName}_${this.direction}`, speed, loop);
    };
    idle = () => {
        this.startAnimation('idle', 4, true);
    };

}