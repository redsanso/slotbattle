import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { StartModule } from "./start/start.module";
import { StartComponent } from "./start/start.component";

let routes : Routes = [
  { path : 'start', component : StartComponent, pathMatch : 'full' }
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, 
    RouterModule.forRoot(routes),
    StartModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
