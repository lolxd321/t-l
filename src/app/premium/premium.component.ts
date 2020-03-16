import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, startWith, map} from 'rxjs/operators';
import { User } from '../models/user.model';

@Component({
  selector: 'app-premium',
  templateUrl: './premium.component.html',
  styleUrls: ['./premium.component.css']
})
export class PremiumComponent implements OnInit {

  userDoc: AngularFirestoreDocument<User>;
  user: Observable<User>;
  users: Observable<any[]>;

  constructor(private db: AngularFirestore, private afAuth: AngularFireAuth) { }

  ngOnInit() {

    this.users = this.db.collection('users').valueChanges();
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
          return this.db.doc<User>(`users/${user.uid}`).valueChanges()
      })
    )
  }


  goPremium() {
    this.afAuth.authState.subscribe(user => {
    if (user) {
        this.db.doc<User>(`users/${user.uid}`).update({premium:true });

    }
    });
  }

}
