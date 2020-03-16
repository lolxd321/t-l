import { Component, OnInit } from '@angular/core';
import { trigger,state,style,animate,transition,} from '@angular/animations';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, startWith, map} from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import {EditLocation} from './editLocation/edit-location';
import {EditLanguage} from './editLanguages/edit-language';
import {EditHeight} from './editHeight/edit-height';
import {EditBodytype} from './editBodyType/edit-bodytype';
import {EditEyes} from './editEyes/edit-eyes';
import {EditHair} from './editHair/edit-hair';
import {EditLooking} from './editLooking/edit-looking';
import {EditAbout} from './editAboutme/edit-aboutme';
import {EditImageComponent} from './edit-image/edit-image.component';
import {AddPictures} from './addPictures/add-pictures';
import { Subscription } from 'rxjs';

interface User {
  uid: string;
  email: string;
  gender?: string;
  displayName?: string;
  birthdate?: Date;
  languages?: [];
  height?: number;
  bodyType?: string;
  eyes?: string;
  hair?: string;
  lookingFor?: [];
  aboutMe?: string;
  country?: string;
  state?: string;
  city?: string;
  url?: string;
}

interface userPicture {
  user_id: string;
  filePath: string;
  url_image: string;
  public?: boolean;
  private?: boolean;
}

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
  animations: [
      // the fade-in/fade-out animation.
      trigger('slideInOut', [
        // the "in" style determines the "resting" state of the element when it is visible.
        state('in', style({opacity: 1})),

        // fade in when created. this could also be written as transition('void => *')
        transition(':enter', [
          style({opacity: 0}),
          animate(600 )
        ]),
        // fade out when destroyed. this could also be written as transition('void => *')
        transition(':leave',
          animate(600, style({opacity: 0})))
      ])
    ]
})


export class EditProfileComponent implements OnInit {


  private pictureCollection: AngularFirestoreCollection<userPicture>;
   userPics: Observable<userPicture[]>;

   userDoc: AngularFirestoreDocument<User>; // referenz zum dokument
   user: Subscription;
   users: Observable<any[]>;
   bDay;
   lookingFor: [];
   languages: [];
   height: number;
   bodyType: string;
   displayName: string;
   eyes: string;
   hair: string;
   aboutMe: string;
   countryName: string;
   stateName: string;
   cityName: string;
   urlPic: string;
   pictureIsPublic = true;
   pictureIsPrivate =false;



  constructor(private db: AngularFirestore, private afAuth: AngularFireAuth, public dialog: MatDialog, private storage: AngularFireStorage) { }


  ngOnInit(){
      this.users = this.db.collection('users').valueChanges();

      this.user = this.afAuth.authState.pipe(
        switchMap(user => {
          if(user) {
            return this.db.doc<User>(`users/${user.uid}`).valueChanges()
          } else {
            return of(null)
          }
        })
      ).subscribe(data => {

        if(data) {
          this.height = data.height;
          this.bodyType = data.bodyType;
          this.eyes = data.eyes;
          this.hair = data.hair;
          this.aboutMe = data.aboutMe;
          this.countryName = data.country;
          this.languages = data.languages;
          this.stateName = data.state;
          this.cityName = data.city;
          this.lookingFor = data.lookingFor;
          this.displayName = data.displayName;
          this.bDay = this.calculateAge(data.birthdate);
          this.urlPic = data.url;
        } else {
          return of(null)
        }
        }, error => {
          console.log(error);
        });


      this.getUserPicsData();
  }




  getUserPicsData() {

  this.afAuth.authState.subscribe(user => {
    if(user){
      this.pictureCollection = this.db.collection('userPictures', ref => {
        return ref.where('user_id', '==', user.uid)
      });
     this.userPics = this.pictureCollection.snapshotChanges().map(actions => {
       return actions.map(a => {
       const data = a.payload.doc.data() as userPicture;
       const id = a.payload.doc.id;
       return { id, ...data };
       });
     });
   } else {
     return of(null)
   }

   });



}


  openEditLocation() {
    this.dialog.open(EditLocation);
  }
  openEditLanguages() {
    this.dialog.open(EditLanguage);
  }
  openEditHeight() {
    this.dialog.open(EditHeight);
  }
  openEditBodytype() {
    this.dialog.open(EditBodytype);
  }
  openEditEyes() {
    this.dialog.open(EditEyes);
  }
  openEditHair() {
    this.dialog.open(EditHair);
  }
  openEditLookingFor() {
    this.dialog.open(EditLooking);
  }
  openEditAboutMe() {
    this.dialog.open(EditAbout);
  }
  openEditProfilePic() {
    this.dialog.open(EditImageComponent);
  }
  openAddPictures() {
    this.dialog.open(AddPictures);
  }
  calculateAge(bDay){
    let birthDate = bDay.toDate().getTime();
    let timeNow = new Date().getTime();
    let ageDifMs = timeNow - birthDate;
    let ageDate = new Date(ageDifMs);
    return (Math.abs(ageDate.getUTCFullYear() - 1970));
  }
  deletePost(picID: string, filePath: string) {
    const ref = this.storage.ref(filePath);
    const task = ref.delete();
    this.db.doc (`userPictures/${picID}`).delete();
  }
  makePicturePublic(picID: string) {
    this.pictureIsPublic = true;
    this.pictureIsPrivate = false;
    this.db.doc (`userPictures/${picID}`).update({public: this.pictureIsPublic, private: this.pictureIsPrivate });
  }
  makePicturePrivate(picID: string) {
    this.pictureIsPublic = false;
    this.pictureIsPrivate = true;
    this.db.doc (`userPictures/${picID}`).update({private: this.pictureIsPrivate, public: this.pictureIsPublic});
  }

}
