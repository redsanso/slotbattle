import { Component, OnInit } from '@angular/core';
import * as Phaser from 'phaser';
import { MenuState } from "../game-states/menu.state";
import { SlotsState } from "../game-states/slots.state";
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

    let menuState = new MenuState();
    menuState.onStartButtonClick = () => {
      parallaxState.switchState('slots');
    };
 
    let slotsState = new SlotsState();
    slotsState.onBackButtonClick = () => {
      parallaxState.switchState('menu');
    };

    parallaxState.setStates({
      'menu' : menuState,
      'slots' : slotsState
    }, 'menu');

    this.currentState = parallaxState;
  }
}
