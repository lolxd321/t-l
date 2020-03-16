import { Component, OnInit } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';
import { tap, finalize, switchMap } from 'rxjs/operators';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { AngularFireAuth } from '@angular/fire/auth';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {MatSnackBar} from '@angular/material/snack-bar';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-edit-image',
  templateUrl: './edit-image.component.html',
  styleUrls: ['./edit-image.component.css']
})

export class EditImageComponent implements OnInit {

  userDoc: AngularFirestoreDocument<User>;
  user: Observable<User>;
  users: Observable<any[]>;
  task: AngularFireUploadTask;
  snapshot: Observable<any>;
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  urlString: string;

  showImage = true;
  showInfoBox = true;
  uploading = false;

  userID: string;
  filePath: string;


  constructor(private storage: AngularFireStorage, private db: AngularFirestore, private afAuth: AngularFireAuth, private dialogRef: MatDialogRef<EditImageComponent>, private _snackBar: MatSnackBar, private auth: AuthService) { }

  ngOnInit(){

    this.urlString = null;
    this.filePath = null;
    this.userID = null;
    this.getDatasFromUser();
  }

  async getDatasFromUser() {
    const {uid} = await this.auth.getUser();
    const {filePath} = await this.auth.getUser();
    this.userID = uid;
    this.filePath = filePath;
  }

 fileChangeEvent(event: any): void {
     this.imageChangedEvent = event;
 }
 imageCropped(event: ImageCroppedEvent) {
     this.croppedImage = event;
     this.showInfoBox = false;
 }

 async upload() {

    try {
     const file = this.croppedImage.file;
     if ( (file.type == null)  || (file.type == 'undefined') || (file.type == '') || (file.type.split('/')[1] !== 'png')) {
       console.error('Unsupported file type! ');
       this.openError1();
       return;
     }
     if (file.size >= 10000000) {
       console.error('The maximum size of picture can be 12 MB!');
       this.openError2();
       return;
     }
     if((this.croppedImage.width <270) || (this.croppedImage.height <270)){
       console.error('The picture must be at least 400 pixels in height and 400 pixels in width!');
       this.openError3();
       return;
     }

     const {filePath} = await this.auth.getUser();

//erster eintrag.. wenn noch kein bild da ist..
     if(filePath == null || filePath == 'undefined' || filePath == '')
     {
     let filePath = `profilePics/${new Date().getTime()}_${this.userID}`;
     this.filePath =filePath;
     const ref = this.storage.ref(filePath);
     const task = ref.put(file);
      this.uploadPercent = task.percentageChanges();
      this.showImage = false;
      this.uploading = true;
      task.snapshotChanges().pipe(
          finalize(() => this.storeProfilePic(ref.getDownloadURL()))
       )
      .subscribe()
    }
    else {
      let filePath =this.filePath;
      const ref = this.storage.ref(filePath);
      const task = ref.put(file);
       this.uploadPercent = task.percentageChanges();
       this.showImage = false;
       this.uploading = true;
       task.snapshotChanges().pipe(
           finalize(() => this.storeProfilePic(ref.getDownloadURL()))
        )
       .subscribe()
    }

   }
    catch (error) {
      this.openError1();
    }

  }

 async storeProfilePic(value) {
   const {uid} = await this.auth.getUser();
    value.subscribe(url => {
    this.urlString = url;

    this.db.doc<User>(`users/${uid}`).update({
      url: url,
      filePath: this.filePath
    });
  });
   this.dialogRef.close();
}


openError1() {
  this._snackBar.open("Unsupported file type!",null,  {
    duration: 5000
  });
}
openError2() {
  this._snackBar.open("The maximum size of picture can be 12 MB!",null,  {
    duration: 5000
  });
}
openError3() {
  this._snackBar.open("The picture must be at least 400 pixels in height and 400 pixels in width!",null,  {
    duration: 5000
  });
}


}
