import { AbstractControl } from "@angular/forms";
import { Observable, Observer } from "rxjs";

export const mimeType = (control: AbstractControl): 
  Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {

  const file = control.value as File;
  const fileReader = new FileReader();

  const frObs = new Observable((observer: Observer<{ [key: string]: any }>) => {
    fileReader.addEventListener("loadend", () => {
      // Create a subarray of the first 4 bytes (the "magic numbers")
      const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4);
      let header = "";
      let isValid = false;

      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }

      // Check the hex header against known image signatures
      switch (header) {
        case "89504e47": // PNG
          isValid = true;
          break;
        case "ffd8ffe0": // JPEG/JPG variants
        case "ffd8ffe1":
        case "ffd8ffe2":
        case "ffd8ffe3":
        case "ffd8ffe8":
          isValid = true;
          break;
        default:
          isValid = false;
          break;
      }

      if (isValid) {
        observer.next(null); // Valid: return null
      } else {
        observer.next({ invalidMimeType: true }); // Invalid: return error object
      }
      
      observer.complete(); // Ensure the observable finishes
    });

    // 2. This starts the reading process!
    fileReader.readAsArrayBuffer(file);
  });

  // 3. Return the observable to the Angular form
  return frObs;
};