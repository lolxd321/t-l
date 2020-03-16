import { Subject } from 'rxjs/Subject';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthData } from './auth-data.model';
import { MatSnackBar } from '@angular/material';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { UIService } from '../shared/ui.service';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, first} from 'rxjs/operators';
import { EditLocation } from '../profile/edit-profile/editLocation/edit-location';
import { OthersProfileComponent } from '../others/others-profile/others-profile.component';
import { User } from '../models/user.model';
//import { AppComponent } from '.././app.component';
import { DbQueriesComponent } from '.././db-queries/db-queries.component';
import { Subscription } from 'rxjs';


@Injectable()
export class AuthService {


  authChange = new Subject<boolean>();
  private isAuthenticated = false;
  user: Observable<User>;
  user2: Subscription;
  users: Observable<any[]>;

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private snackbar: MatSnackBar,
    private uiService: UIService,
    private editLocation: EditLocation,
    private othersProfileComponent: OthersProfileComponent,
    private dbQueries: DbQueriesComponent,


  ) {
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {


        if (user) {

          // const newPassword = "12345678";
          //
          // user.updatePassword(newPassword).then(function() {
          //   console.log("erfolgrich")
          // }).catch(function(error) {
          //   console.log(error)
          // });

          return this.db.doc<User>(`users/${user.uid}`).valueChanges()
        } else {
          return of(null)
        }
      })
    )




  }






  getUser() {
  return this.user.pipe(first()).toPromise();
  }

  initAuthListener() {
  this.afAuth.authState.subscribe(user => {
      if (user) {
        this.isAuthenticated = true;
        this.authChange.next(true);
      }
      else {
        this.authChange.next(false);
        this.isAuthenticated = false;
      }
      });
  }



  // // Sign in with Facebook
  // FacebookAuth() {
  //   return this.AuthLogin(new auth.FacebookAuthProvider());
  // }
  //
  // Auth logic to run auth providers
  // AuthLogin(provider) {
  //   return this.afAuth.auth.signInWithPopup(provider)
  //   .then((result) => {
  //       console.log('You have been successfully logged in!')
  //   }).catch((error) => {
  //       //console.log(error)
  //   })
  // }



  async FacebookAuthLogin() {
    const provider = new auth.FacebookAuthProvider();
    const credential = await this.afAuth.auth.signInWithPopup(provider);

    this.user2 = this.afAuth.authState.pipe(
      switchMap(user => {
        if(user) {
          return this.db.doc<User>(`users/${user.uid}`).valueChanges()
        } else {
          return of(null)
        }
      })
    ).subscribe(data => {
      if(data) {
        this.router.navigate(['/browse/girls']);
      } else {
        this.afAuth.auth.signOut();
        this.router.navigate(['/welcome']);
        this.snackbar.open("Please register with Facebook.", null, {
          duration: 8000
        });

      }
      }, error => {
        console.log(error);
      });
  }


  async FacebookAuth(gender: string, birthdate: Date) {
    const provider = new auth.FacebookAuthProvider();
    const credential = await this.afAuth.auth.signInWithPopup(provider);
    return this.updateUserDataAfterFacebookLogin(credential.user, gender, birthdate);
  }


  private updateUserDataAfterFacebookLogin(user, gender, birthdate) {
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument<User> = this.db.doc(`users/${user.uid}`);


    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      userVisitedMeCounterOld: 0,
      gender: gender,
      birthdate: birthdate,
      lastActivity: Date.now()
    }
    this.router.navigate(['/browse/girls']);
    return userRef.set(data, { merge: true })

  }



 registerUser(authData: AuthData, gender: string, displayName: string, birthdate: Date) {

    this.afAuth.auth
      .createUserWithEmailAndPassword(authData.email, authData.password)
      .then(result => {
        this.updateUserData(result.user, gender, displayName, birthdate),
        this.dbQueries.createAdminMessage(result.user.uid);
        this.router.navigate(['/browse/girls']);
      })
      .catch(error => {
        this.uiService.loadingStateChanged.next(false);
        this.snackbar.open(error.message, null, {
          duration: 3000
        });
      });
  }


  private updateUserData(user, gender: string, displayName: string, birthdate: Date) {
    const userRef: AngularFirestoreDocument<any> = this.db.doc(`users/${user.uid}`);

    if(gender =="Female"){

      const data: User = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        gender: gender,
        birthdate: birthdate,
        userVisitedMeCounterOld: 0,
        premium: true,
        lastActivity: Date.now() }
        return userRef.set(data, { merge: true })

      } else {
        const data: User = {
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          gender: gender,
          birthdate: birthdate,
          userVisitedMeCounterOld: 0,
          premium: false,
          lastActivity: Date.now()}
          return userRef.set(data, { merge: true })
      }



  }


  login(authData: AuthData) {
    this.afAuth.auth
      .signInWithEmailAndPassword(authData.email, authData.password)
      .then(result => {
        this.router.navigate(['/browse/girls']);
      })
      .catch(error => {
        this.snackbar.open(error.message, null, {
          duration: 3000
        });
      });
  }

  logout() {
    this.router.navigate(['/welcome']);
    this.afAuth.auth.signOut();

    this.editLocation.cancelSubscriptions();
    this.othersProfileComponent.cancelSubscriptions();

  }


  isAuth() {
    return this.isAuthenticated;
  }

  calculateAge(bDay){
    let birthDate = bDay.toDate().getTime();
    let timeNow = new Date().getTime();
    let ageDifMs = timeNow - birthDate;
    let ageDate = new Date(ageDifMs);
    return (Math.abs(ageDate.getUTCFullYear() - 1970));
  }

  private authSuccessfully() {
    this.authChange.next(true);
    this.router.navigate(['/test']);
  }


  ngOnDestroy() {
      this.afAuth.auth.signOut();
  }

}
