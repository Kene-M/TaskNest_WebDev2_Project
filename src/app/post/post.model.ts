// Interface for a post object.
// This file defines the structure of a post object in the application. It is used
//  to ensure that any post object created or manipulated in the application has 
// the required properties and types.
export interface Post {
  id: string | null;
  title: string;
  content: string;
  imagePath?: string;
}