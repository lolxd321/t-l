import {Component,OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import {CountriesService } from '../../../dropdown/countries.service';
import { Observable, of } from 'rxjs';
import { switchMap, startWith, map} from 'rxjs/operators';


interface User {
  bodyType?: string;
}

@Component({
  selector: 'app-edit-bodytype',
  templateUrl: './edit-bodytype.html',
  styleUrls: ['./edit-bodytype.css']
})

export class EditBodytype implements OnInit  {

  userDoc: AngularFirestoreDocument<User>;
  user: Observable<User>;
  users: Observable<any[]>;

  bodyType: string;


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
      if (this.bodyType != null )
      {
        this.db.doc<User>(`users/${user.uid}`).update({bodyType:this.bodyType });
        this.bodyType = null;
      }
    }
    });

  }

}
