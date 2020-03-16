import {Component,OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import {CountriesService } from '../../../dropdown/countries.service';
import { Observable, of } from 'rxjs';
import { switchMap, startWith, map} from 'rxjs/operators';


interface User {
  lookingFor?: [];
}


@Component({
  selector: 'app-edit-looking',
  templateUrl: './edit-looking.html',
  styleUrls: ['./edit-looking.css']
})

export class EditLooking implements OnInit  {

  userDoc: AngularFirestoreDocument<User>;
  user: Observable<User>;
  users: Observable<any[]>;

  lookingForList: string[] = ['Friends', 'Adventure', 'Soulmate', 'Job'];
  lookingFor: [];


  constructor(private db: AngularFirestore, private afAuth: AngularFireAuth, private country:CountriesService) { }


  ngOnInit(){

    this.users = this.db.collection('users').valueChanges();
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
          //console.log(user.email);
          return this.db.doc<User>(`users/${user.uid}`).valueChanges()
      })
    )
  }


  updateContent() {
    this.afAuth.authState.subscribe(user => {
    if (user) {
      if (this.lookingFor &&  this.lookingFor.length != 0)
      {
        this.db.doc<User>(`users/${user.uid}`).update({lookingFor: this.lookingFor});
        this.lookingFor = null;
      }
    }
    });

  }

}
