import * as Phaser from 'phaser';

export class Test {
    game : Phaser.Game;
    sky : any;
    skyDirection : number = 0;

    constructor(elementRef : string){
        this.game = new Phaser.Game(800, 600, Phaser.AUTO, elementRef, {
            preload : this.preload,
            create  : this.create,
            render  : this.render
        });
    }

    preload(){
        console.log('preload');
        this.game.world.setBounds(0, 0, 1280, 600);
        this.game.load.image('sky', 'assets/darkmoon.png');
    }

    create(){
        console.log('create');
        this.skyDirection = -1;
        this.sky = this.game.add.sprite(0, 0, 'sky');
        console.log(this.sky);
    }
 
    render(){
        console.log(`position x = ${this.sky.position.x} and sky width = ${this.sky.texture.width}`);
        if(Math.abs(this.sky.position.x) >= this.sky.texture.width / 2)
            this.skyDirection = this.skyDirection * -1;

        this.sky.position.x += this.skyDirection;
    }
}
