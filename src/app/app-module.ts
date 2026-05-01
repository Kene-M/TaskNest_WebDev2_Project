import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule } from '@angular/forms'; // For two way binding
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field'; // Angular Material Form Field we are adding.
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { App } from './app';
import { MostCreate } from './post/most-create/most-create';
import { PostList } from './post/post-list/post-list';
import { Header } from './header/header/header';
import { AppRoutingModule } from './app-routing-module'; // routing module

@NgModule({
  declarations: [
    App,
    MostCreate,
    PostList,
    Header,
  ],
  imports: [
    BrowserModule,
    FormsModule, 
    ReactiveFormsModule,
    MatFormField, 
    MatIconModule, 
    MatInputModule, 
    MatButtonModule, 
    MatCardModule, 
    MatToolbarModule, 
    MatExpansionModule, AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptorsFromDi())
  ],
  bootstrap: [App]
})
export class AppModule { }
