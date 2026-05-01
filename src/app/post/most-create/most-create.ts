import { Component, ChangeDetectionStrategy, EventEmitter, Output, OnInit } from '@angular/core';
// changeDetectionStrategy is used to optimize performance by controlling when the component should be checked for changes.
// EventEmitter is used to create custom events that can be emitted from the component to its parent component.
// Output is a decorator that marks a property as an output property that can be bound to an event in the parent component.
import { Post } from '../post.model'; // Import the Post interface from the post.model.ts
import { NgForm, Validators } from '@angular/forms'; // Import the NgForm class from the @angular/forms package. This class is used to represent a form in Angular and provides methods for handling form submission and validation.
import { PostService } from '../post-service'; 
import { ActivatedRoute, ParamMap } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { mimeType } from './mime-type.validator';
//

@Component({
  selector: 'app-most-create',
  standalone: false,
  templateUrl: './most-create.html',
  styleUrl: './most-create.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MostCreate implements OnInit {
  enterTitle='';
  enterData='';
  mode = 'create';
  postId: string | null = null;
  post!: Post;
  form: FormGroup;
  imagePreview: string | null = null;

  // Not used anymore since we are using observables instead of EventEmitter
  // @Output() postCreated = new EventEmitter<Post>(); // EventEmitter is used to create a custom event called postCreated that emits a Post object when a new post is created. The @Output() decorator marks the postCreated property as an output property that can be bound to an event in the parent component.
                          // @Output is a decorator that marks a property as an output property
                          //  that can be bound to an event in the parent component. It allows the parent component to listen for events emitted by the child component.
  
                          
  //anyPost="";
  // Takes care of some data. This is the function that is called when the user clicks the "Save Post" button. It creates a new Post object with the title and content entered by the user, and emits the postCreated event to notify the parent component that a new post has been created.
  /*onAddPost()
  {
    // this.anyPost = this.enterData

    const post: Post = {
      title: this.enterTitle,
      content: this.enterData
    }

    this.postCreated.emit(post); // emit is used to send the post object to the 
                                // parent component that listens for the postCreated event.
  }*/
 
  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {validators: [Validators.required]}),
      content: new FormControl(null, {validators: [Validators.required]}),
      image: new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeType]})
    })
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        // Fetch the post from the server using the postId and populate the form with the post data.
        const foundPost = this.postService.getPost(this.postId!);
        this.form.setValue({
          title: foundPost?.title,
          content: foundPost?.content
        })
        if (!foundPost) {
          return;
        }
        this.post = foundPost;
        this.enterTitle = this.post.title;
        this.enterData = this.post.content;
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    })
  }

  constructor(private postService: PostService, public route: ActivatedRoute) {} 

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    if (this.mode === 'create') {
      this.postService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
    } else {
      this.postService.updatedPost(this.postId!, this.form.value.title, this.form.value.content);
    }
    this.form.reset()
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if(!file) {
      return;
    }
    this.form.patchValue({image: file});
    this.form.get('image')!.updateValueAndValidity();
    console.log(file);
    console.log(this.form);
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      // this.cdr.markForCheck(); - "cdr" gives and error rn
    }
    reader.readAsDataURL(file);
  }


  /*
  onAddPost(form: NgForm) {
    // Check if the form is valid. If it is not valid, return 
    // from the function and do not create a new post.
    if (form.invalid) {
      return;
    }
    const post: Post = {
      id: null,
      title: form.value.title,
      content: form.value.content
    }
    //this.postCreated.emit(post);
    this.postService.addPost(post.title, post.content); 
  }
  */
}
