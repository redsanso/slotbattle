import { Component, OnInit } from '@angular/core';
import * as Phaser from 'phaser';
import { MenuState } from "../game-states/menu.state";
import { ParallaxState } from "../game-states/parallax.state";

@Component({
  selector: 'start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {
  currentState : Phaser.State;
  constructor() { }
  ngOnInit() {
    let parallaxState = new ParallaxState();
    parallaxState.setStates({
      'menu' : new MenuState()
    }, 'menu');

    this.currentState = parallaxState;
  }
}
