import { Component, OnInit, OnChanges, SimpleChange, Input } from '@angular/core';
import * as Phaser from 'phaser';

@Component({
  selector: 'game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  @Input()
  currentState: Phaser.State;
  states: { [name: string]: Phaser.State };
  current: Phaser.Game;

  constructor() {
    //this.current = new Phaser.Game(document.body.clientWidth, document.body.clientHeight, Phaser.AUTO, 'game');
    this.current = new Phaser.Game(1080, 600, Phaser.AUTO, 'game');
  }

  ngOnInit() {

  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    if (changes.currentState.currentValue.key) {
      this.current.state.add(changes.currentState.currentValue.key, changes.currentState.currentValue);
      this.current.state.start(changes.currentState.currentValue.key);
    }
  }

}
