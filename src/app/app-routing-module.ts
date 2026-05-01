import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PostList } from './post/post-list/post-list';
import { MostCreate } from './post/most-create/most-create';


const routes: Routes = [
  {path: '', component: PostList},
  {path: 'create', component: MostCreate},
  {path: 'edit/:postId', component: MostCreate}
];

@NgModule({
  declarations: [],
  imports: [
    //CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
