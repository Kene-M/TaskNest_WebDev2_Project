import { Injectable } from '@angular/core';
import { Post } from './post.model'; // Interface for Post object
import { Subject } from 'rxjs';
import {map} from 'rxjs/operators'

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private post: Post[] = []; // Array to hold Post objects
  private postUpdated = new Subject<Post[]>(); 

  constructor(private http: HttpClient) {} // Constructor for the PostService class

  getPosts() {
    //return [...this.post]; // Return a copy of the post array to prevent direct modification
    //return this.post;

    // Basically the same structure as Post
    //this.http.get<{message: string, posts: {_id: string, title: string, content: string}[]}>("http://localhost:3000/api/posts")
    this.http.get<{message: string, posts: any[]}>("http://localhost:3000/api/posts")
    .pipe(map((postData) => {
      return postData.posts.map (post => {
        return {
          id: post._id,
          title: post.title,
          content: post.content,
          imagePath: post.imagePath
        }
      })
    }))
    .subscribe((response) => {
      this.post = response;
      this.postUpdated.next([...this.post])
    })
  }

  
  /*addPost(title: string, content: string) {
    //const post: Post = { title: title, content: content }; 
    const post: Post = { id: null, title: title, content: content }; 
    this.http.post<{message: string}>("http://localhost:3000/api/posts", post)
      .subscribe((response) => {
        console.log(response.message);
        this.post.push(post);
        this.postUpdated.next([...this.post]);
      });
    this.post.push(post); // Add the new Post object to the post array
    this.postUpdated.next([...this.post]); // Notify subscribes of the updated post array
  }*/
  addPost(title: string, content: string, image: File) {
    // const post: Post = { id: null,title: title, content: content };
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http.post<{message: string, postId: string, imagePath: string}>('http://localhost:3000/api/posts', postData)
      .subscribe((response) => {
        const post: Post = { 
          id: response.postId, 
          title: title, 
          content: content,
          imagePath: response.imagePath
        };
        this.post.push({...post, id: response.postId});
        this.postUpdated.next([...this.post]);
      });
  }

  getPostUpdateListener() {
    return  this.postUpdated.asObservable(); // Return the postUpdated subject as an observable for subscribers
  }

  deletePost(postId: string) {
  this.http.delete('http://localhost:3000/api/posts/' + postId)
  .subscribe(() => {
    const updatedPosts = this.post.filter(post => post.id !== postId);
    this.post = updatedPosts;
    this.postUpdated.next([...this.post]);
  })
}

  getPost(id: string): Post | undefined {
    return this.post.find(p => p.id === id);
  }
  
  updatedPost(id: string, title: string, content: string) {
    //const post: Post = { id: id, title: title, content: content };
    const postData = new FormData();
    postData.append("id", id);
    postData.append("title", title);
    postData.append("content", content);
    //this.http.put("http://localhost:3000/api/posts/" + id, post)
    this.http.put<{message: String, post: Post }>("http://localhost:3000/api/posts/" + id, postData)
      .subscribe(response => {
        const updatedPosts = [...this.post];
        const oldPostIndex = updatedPosts.findIndex(p=> p.id === id);
        //updatedPosts[oldPostIndex] = post;
        updatedPosts[oldPostIndex] = {
          id: id,
          title: title,
          content: content,
          imagePath: response.post.imagePath
        }
        this.post = updatedPosts;
        this.postUpdated.next([...this.post]);
      });
  }

}