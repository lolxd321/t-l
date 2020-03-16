import {Component,OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import {CountriesService } from '../../../dropdown/countries.service';
import { Observable, of } from 'rxjs';
import { switchMap, startWith, map} from 'rxjs/operators';


interface User {
  languages?: [];
}


@Component({
  selector: 'app-edit-language',
  templateUrl: './edit-language.html',
  styleUrls: ['./edit-language.css']
})

export class EditLanguage implements OnInit  {

  userDoc: AngularFirestoreDocument<User>;
  user: Observable<User>;
  users: Observable<any[]>;

  languageList: string[] = ['English', 'French', 'Spanish', 'Arabic', 'German', 'Italian', 'Armenian', 'Azerbaijani', 'Belorussian', 'Bengali', 'Bulgarian', 'Catalan', 'Chinese', 'Croatian', 'Czech', 'Danish', 'Dutch', 'Esperanto', 'Estonian', 'Filipino', 'Finnish', 'Georgian', 'Greek', 'Hebrew', 'Hindi', 'Hungarian', 'Icelandic', 'Indonesian', 'Japanese', 'Korean', 'Kurdish' , 'Latvian' , 'Lithuanian' , 'Maltese' , 'Nepali', 'Norwegian', 'Persian' , 'Polish' , 'Portuguese' , 'Romanian', 'Russian', 'Serbian', 'Slovak', 'Slovenian', 'Swedish', 'Thai', 'Turkish', 'Ukrainian', 'Urdu', 'Vietnamese'];
  languages: [];


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

      if (this.languages &&  this.languages.length != 0)
      {
        this.db.doc<User>(`users/${user.uid}`).update({languages: this.languages});
        this.languages = null;
      }
    }
    });

  }

}
