import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StartComponent } from './start.component';
import { GameModule } from '../game/game.module';

@NgModule({
  imports: [CommonModule, GameModule],
  declarations: [StartComponent]
})
export class StartModule { }
