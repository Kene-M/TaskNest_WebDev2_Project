import { Component, signal } from '@angular/core';
import { Post } from './post/post.model'; // Import the Post interface from the post.model.ts
                                  //  file to define the structure of a post object.

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  //protected readonly title = signal('ourAngularFirst');
  
  /* Removed due to using observables instead of EventEmitters
  storedPost: Post[] = [];

  onPostAdded(post: Post) {
    this.storedPost.push(post);
  }*/
}
