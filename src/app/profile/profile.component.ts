import { Component, OnInit } from '@angular/core';
import { trigger,state,style,animate,transition,} from '@angular/animations';

import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, startWith, map} from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import { User } from '../models/user.model';
import { ToVisit } from '../models/toVisit.model';
import {UserPicture} from '../models/userPicture.model';

//
// interface User {
//   uid: string;
//   email: string;
//   gender?: string;
//   displayName?: string;
//   birthdate?: Date;
//   languages?: [];
//   height?: number;
//   bodyType?: string;
//   eyes?: string;
//   hair?: string;
//   lookingFor?: [];
//   aboutMe?: string;
//   country?: string;
//   state?: string;
//   city?: string;
//   url?: string;
// }
// export interface ToVisit {
//   dataArray: any [];
//   user_id?: string;
// }
// interface userPicture {
//   user_id: string;
//   filePath: string;
//   url_image: string;
//   public?: boolean;
//   private?: boolean;
// }

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  animations: [
      trigger('slideInOut', [
        state('in', style({opacity: 1})),
        transition(':enter', [
          style({opacity: 0}),
          animate(600 )
        ]),
        transition(':leave',
          animate(600, style({opacity: 0})))
      ])
    ]
})
export class ProfileComponent implements OnInit {

  private visitCollection: AngularFirestoreCollection<ToVisit>;
  visits: Observable<ToVisit[]>;
  userVisits: Observable<ToVisit[]>;

  private pictureCollection: AngularFirestoreCollection<UserPicture>;
  userPics: Observable<UserPicture[]>;

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
  gender: string;

  showVisits = false;


  urlPic: string;

  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;


  constructor(private db: AngularFirestore, private afAuth: AngularFireAuth, private storage: AngularFireStorage) {
    this.visitCollection = db.collection<ToVisit>('toVisit');
    this.getUserWantToVisits();
   }


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
        if(data)
        {
          this.height = data.height;
          this.bodyType = data.bodyType;
          this.eyes = data.eyes;
          this.hair = data.hair;
          this.gender = data.gender;
          this.aboutMe = data.aboutMe;
          this.countryName = data.country;
          this.languages = data.languages;
          this.stateName = data.state;
          this.cityName = data.city;
          this.lookingFor = data.lookingFor;
          this.displayName = data.displayName;
          this.bDay = this.calculateAge(data.birthdate);
          this.urlPic = data.url;
        }else {
          return of(null)
        }
        });
        this.getUserPicsData();
  }

  getUserPicsData() {
  this.afAuth.authState.subscribe(user => {

  if(user) {
   this.pictureCollection = this.db.collection('userPictures', ref => {
     return ref.where('user_id', '==', user.uid)
   });

   this.userPics = this.pictureCollection.snapshotChanges().map(actions => {
     return actions.map(a => {
     const data = a.payload.doc.data() as UserPicture;
     const id = a.payload.doc.id;
     return { id, ...data };
     });
     });
   } else {
       return of(null)
   }

   });

}

  getUserWantToVisits() {
    this.afAuth.authState.subscribe(user => {

    if(user) {
     this.visitCollection = this.db.collection('toVisit', ref => {
       return ref.where('user_id', '==', user.uid)
     });
     this.userVisits = this.visitCollection.snapshotChanges().map(actions => {
       return actions.map(a => {
       if(a.payload.doc.id != null) {
         this.showVisits = true;
       }
       const data = a.payload.doc.data() as ToVisit;
       const id = a.payload.doc.id;
       return { id, ...data };
       });
       });
     }else {
      return of(null)
     }


     });
  }

  calculateAge(bDay){
    let birthDate = bDay.toDate().getTime();
    let timeNow = new Date().getTime();
    let ageDifMs = timeNow - birthDate;
    let ageDate = new Date(ageDifMs);
    return (Math.abs(ageDate.getUTCFullYear() - 1970));
  }

}
