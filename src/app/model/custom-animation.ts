import * as Phaser from 'phaser';
import * as _ from 'lodash';

export interface ICustomAnimationFrames {
  rowIndex : number;
  colIndex : number;
  frames   : number[];
}

export class CustomAnimationFrames implements ICustomAnimationFrames {
  name : string;
  rowIndex : number;
  colIndex : number;
  frames   : number[];

  constructor(name : string, rowIndex : number, colIndex : number, frameCount : number, player : Phaser.Sprite, bounce : boolean = false){
    this.name = name;
    this.rowIndex = rowIndex;
    this.colIndex = colIndex;
    let startIndex = (rowIndex * 13 + colIndex);
    this.frames = _.range(startIndex, startIndex + frameCount);
    if(bounce) {
      this.frames.concat(_.rangeRight(startIndex, startIndex + frameCount));
    }
    player.animations.add(this.name, this.frames);
  }

  getFramesCount(){
    return this.frames.length * 2;
  }
}

export class CustomAnimationGroup {
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

  getFramesCount(direction : string){
    return this[direction] ? this[direction].getFramesCount() : 0;
  }
}

export class CustomAnimationSet {
  [key : string] : Phaser.Animation;
}
