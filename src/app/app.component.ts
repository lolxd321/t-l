import { Component, OnInit, EventEmitter,Output, OnDestroy,HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Routes, RouterModule } from '@angular/router';
import {AuthService} from './auth/auth.service';
import { Subscription } from 'rxjs/Subscription';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from './models/user.model';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, startWith, map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/do';
import * as firebase from 'firebase';
import { DbQueriesComponent } from './db-queries/db-queries.component';
import { ConversationData } from './models/conversationData.model';

export interface UserVisit {
  id?: string;
  my_id: string;
  userVisitMe_id: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

@Injectable()
export class AppComponent implements OnInit, OnDestroy {

  private userVisitCollection: AngularFirestoreCollection<UserVisit>;
  private userVisitsObservable: Observable<UserVisit[]>;
  private userCollection: AngularFirestoreCollection<User>;
  private users: Observable<User[]>;
  userVisitedMe = [] ;
  counterUserVisitedMeOldDB = 0;
  counterUserVisitedMeCurrentDB =0;
  isAuth = false;
  authSubscription: Subscription;
  subCount : Subscription;
  browseGirlActive= false;
  tripsActive= false;
  favoritesActive = false;
  conversationsActive=false;
  onProfile =false;
  count = 0;
  userID;

  lastChatId: string;

  valueToTransfer = 0;
  private fbSubs: Subscription[] = [];
  public chatsReceived: Observable<ConversationData[]>;
  private chatCollection: AngularFirestoreCollection<ConversationData>;
  public chat: Observable<ConversationData[]>;

  gender: string;
  test = 1;
  isAdmin = false;

  openSidenav = false;
  onMobile = false;
  notMobile = true;

  sideNavOpen= true;


  constructor(
    private authService: AuthService,
    private db: AngularFirestore,
    private afAuth: AngularFireAuth,
    private dbQueries: DbQueriesComponent,
    private router: Router) { }
//onLogin das ausführen ..


@HostListener('window:resize', ['$event'])
onResize(event) {
  if(event.target.innerWidth <= 960) {
    this.sideNavOpen = false;
  }else if( event.target.innerWidth > 960) {
    this.sideNavOpen = true;
  }
}


  ngOnInit() {





    this.initConversation();
    this.authService.initAuthListener();
    this.authSubscription = this.authService.authChange.subscribe(authStatus => {
      this.isAuth = authStatus;
    });

    this.getMyProfileVisitors();
      // setTimeout(() =>  { this.getMyProfileVisitors()} , 3000);
  //    console.log("NGOnInit ausgeführt");
  }



  async initConversation() {
    this.afAuth.authState.subscribe(user => {
        if (user) {


          this.dbQueries.getReceivedChatCollectionAsObservable(user.uid);
          this.chatsReceived = this.dbQueries.chatsReceived;
          this.lastChatId = "";

          if(user.email == "admin@gmx.de") {
            this.isAdmin = true;
            this.router.navigate(['/admin/dashboard/fakes']);
          }


          this.fbSubs.push(this.chatsReceived.subscribe( data => {
            if(typeof data != "undefined" && data != null && data.length != null && data.length > 0) {
              let lastElement = data.pop();
              this.lastChatId = lastElement.chatID;
            } else {
              this.lastChatId = "";
            }
          }));
        }
        else {
          console.log("net eingeloggt");
        }
    });


  }




  getMyProfileVisitors() {

    //console.log("getmyProfileVisitors ausgefüphrt");
    this.fbSubs.push(this.afAuth.authState.pipe(
     switchMap(user => {
       if(user) {
         //this.db.doc<User>(`users/${user.uid}`).update({userVisitedMeCounterCurrent:0 });
         return this.db.doc<User>(`users/${user.uid}`).valueChanges()
       } else {
         return of(null)
       }
     })
   ).subscribe(data => {
     if(data) {
       this.counterUserVisitedMeOldDB = data.userVisitedMeCounterOld;
       this.counterUserVisitedMeCurrentDB = data.userVisitedMeCounterCurrent;
       this.gender = data.gender;
     } else {
       return of(null)
     }
     }, error => {
     //  console.log(error);
     }));



    // find all userIds who visited me
  this.fbSubs.push(this.afAuth.authState.subscribe(user => {
      if(user) {
        this.userVisitCollection = this.db.collection('userToVisit', ref => {
          return ref.where('my_id', '==', user.uid)
        });

        this.userVisitsObservable = this.userVisitCollection.snapshotChanges().map(actions => {
          return actions.map(a => {
          const data = a.payload.doc.data() as UserVisit;
          const id = a.payload.doc.id;
          return { id, ...data };
          });
        });

        // get ID of all user who has visited me
        this.fbSubs.push(this.userVisitsObservable.subscribe(userVisits => {
          let userVisitedMeIDs = [];

          for (let userVisit of userVisits) {
            userVisitedMeIDs.push(userVisit.userVisitMe_id);
          }
          this.userCollection = this.db.collection('users');
          this.users = this.userCollection.valueChanges();

//live subscriptopon sobald sich was ändert wird dsa hier ausgeführt
// ausgabe der anzahl von allen Usern die meinen account folgen, unabhängig vom resetten über klick auf profile-visitors
          this.fbSubs.push(this.users.subscribe(allUsers => {

          // array resetten
            this.userVisitedMe = [];

            for (let user of allUsers) {
              if(userVisitedMeIDs.includes(user.uid))
              {
                this.userVisitedMe.push(user.uid);
              }
            }

             this.count = this.userVisitedMe.length - this.counterUserVisitedMeOldDB;
             this.valueToTransfer = this.count + this.counterUserVisitedMeOldDB ;


             // console.log("user old :" + this.counterUserVisitedMeOldDB);
             // console.log("user current " + this.counterUserVisitedMeCurrentDB);

            // this.allUsers = this.userVisitedMe.length;

            // console.log("count : " + this.count +"neu");



          }))

        }));


        // //console.log(this.userVisitedMe.length);
        // this.fbSubs.push(this.afAuth.authState.subscribe(user => {
        //   if(user) {
        //     //this.userVisitedMe = [];
        //   //  console.log(this.userVisitedMe.length);
        //   this.db.doc<User>(`users/${user.uid}`).update({userVisitedMeCounterCurrent: this.count });
        //   }else {
        //     return of(null)
        //   }
        // }))

      } else {
        return of(null)
      }
    }));
  }






  onLogin() {
    // this.authService.initAuthListener();
    //  this.authSubscription = this.authService.authChange.subscribe(authStatus => {
    //    this.isAuth = authStatus;
    //  });
    //
    //   this.fbSubs.push(this.afAuth.authState.pipe(
    //    switchMap(user => {
    //      if(user) {
    //        this.db.doc<User>(`users/${user.uid}`).update({userVisitedMeCounterCurrent:0 });
    //        return this.db.doc<User>(`users/${user.uid}`).valueChanges()
    //      } else {
    //        return of(null)
    //      }
    //    })
    //  ).subscribe(data => {
    //    if(data) {
    //      this.userID = data.uid;
    //      this.counterUserVisitedMe = data.userVisitedMeCounterCurrent;
    //    } else {
    //      return of(null)
    //    }
    //    }, error => {
    //     // console.log(error);
    //    }));

       // this.getMyProfileVisitors();
       // //this.getProfileVisitorsCount();
       // console.log("onLogin ausgeführt");
       // this.count = 6;


       // erst ausführen wenn erfolgreich login...
  }

  ngOnDestroy() {
    this.fbSubs.forEach( sub => sub.unsubscribe());
    this.afAuth.auth.signOut();
  }


  cancelSubscriptions() {
    this.fbSubs.forEach( sub => sub.unsubscribe());
  }



  getProfileVisitorsCount() {
    //console.log(this.userVisitedMe.length);
    this.fbSubs.push(this.afAuth.authState.subscribe(user => {
      if(user) {
        //this.userVisitedMe = [];
      //  console.log(this.userVisitedMe.length);
      this.db.doc<User>(`users/${user.uid}`).update({userVisitedMeCounterCurrent: this.count });
      }else {
        return of(null)
      }
    }))

  }


  step = 0;
  setStep(index: number) {
    this.step = index;
  }
  nextStep() {
    this.step++;
  }
  prevStep() {
    this.step--;
  }


}
