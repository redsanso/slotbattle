import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { StartModule } from "./start/start.module";
import { StartComponent } from "./start/start.component";
import { GameModule } from "./game/game.module";

let routes : Routes = [
  { path : '', redirectTo : 'start', pathMatch : 'full' },
  { path : 'start', component : StartComponent, pathMatch : 'full' }
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, 
    RouterModule.forRoot(routes),
    StartModule,
    GameModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
