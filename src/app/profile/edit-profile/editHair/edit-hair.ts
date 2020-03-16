import {Component,OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, startWith, map} from 'rxjs/operators';


interface User {
  hair?: string;
}

@Component({
  selector: 'app-edit-hair',
  templateUrl: './edit-hair.html',
  styleUrls: ['./edit-hair.css']
})

export class EditHair implements OnInit  {

  userDoc: AngularFirestoreDocument<User>;
  user: Observable<User>;
  users: Observable<any[]>;

  hair: string;


  constructor(private db: AngularFirestore, private afAuth: AngularFireAuth) { }


  ngOnInit(){
    this.users = this.db.collection('users').valueChanges();
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
          return this.db.doc<User>(`users/${user.uid}`).valueChanges()
      })
    )
  }

  updateContent() {
    this.afAuth.authState.subscribe(user => {
    if (user) {
      if (this.hair != null )
      {
        this.db.doc<User>(`users/${user.uid}`).update({hair:this.hair });
        this.hair =null;
      }
    }
    });

  }

}
