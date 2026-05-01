import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model'; // Import the Post interface from the post.model.ts
import { PostService } from '../post-service'; // Import the PostService class from the post-service.ts
import { Subscription } from 'rxjs'; // Manage subjects

@Component({
  selector: 'app-post-list',
  standalone: false,
  templateUrl: './post-list.html',
  styleUrl: './post-list.css',
})
export class PostList implements OnInit, OnDestroy {
/*posts = [
  {title: 'First Post', content: 'This is the first post\'s content'},
  {title: 'Second Post', content: 'This is the second post\'s content'},
  {title: 'Third Post', content: 'This is the third post\'s content'},
  {title: 'Fourth Post', content: 'This is the fourth post\'s content'},
];*/

private postsSub!: Subscription; // Subscription to manage observables from the PostService

// Used before we started using Post interface.
// posts = []

// Not used anymore since we are using observables instead of EventEmitter
// @Input() posts: Post[] = [
// ]; 

// Using Post Interace and observables to manage posts.
posts: Post[] = [

];

constructor(public postService: PostService) {
//this.posts = this.postService.getPosts();
}

ngOnInit(): void {
  //this.posts = this.postService.getPosts();
  this.postService.getPosts();
  this.postsSub = this.postService.getPostUpdateListener().subscribe((posts: Post[]) => {
    this.posts = posts; // Update the posts array whenever the observable emits a new value 
  })
}

onDelete(postId: string) {
  this.postService.deletePost(postId);
}

ngOnDestroy() {
  this.postsSub.unsubscribe(); // Unsubscribe from the observable to prevent memory leaks
}
}