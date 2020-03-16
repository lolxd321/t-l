import { Component, OnInit } from '@angular/core';
import { trigger,state,style,animate,transition,} from '@angular/animations';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, startWith, map} from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from '../../models/user.model';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import {AppComponent } from '../../app.component';
import * as moment from 'moment';


export interface UserVisit {
  id?: string;
  my_id: string;
  userVisitMe_id: string;
  visitTime: string;
}

export interface UserFollow {
  id?: string;
  user_id: string;
  userToFollow_id: string;
}

@Component({
  selector: 'app-profile-visitors',
  templateUrl: './profile-visitors.component.html',
  styleUrls: ['./profile-visitors.component.css'],
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

export class ProfileVisitorsComponent implements OnInit {

  private userVisitCollection: AngularFirestoreCollection<UserVisit>;
  private userVisitsObservable: Observable<UserVisit[]>;
  private userCollection: AngularFirestoreCollection<User>;

  private userDataObservable: Observable<User[]> ;
  private userDataObservable2: Observable<User[]>;
  private userFollowCollection: AngularFirestoreCollection<UserFollow>;
  userFollows: Observable<UserFollow[]>;

  private users: Observable<User[]>;

  userVisitedMe = [] ;
  userVisitedMeIDAndTime = [];
  userIamFollowingID=[];
  userIamFollowingAll=[];
  myId ="";

  private fbSubs: Subscription[] = [];


  constructor(private appCompo: AppComponent, private db: AngularFirestore, private afAuth: AngularFireAuth,private router: Router) { }

  ngOnInit() {
    this.getMyProfileVisitors();
    this.getUserIamFollowing();
// hier den current counter hin
    this.fbSubs.push(this.afAuth.authState.pipe(
      switchMap(user => {
        if(user &&  this.appCompo.valueToTransfer!=0) {
          //old + count
          // fehler.. wenn genau von hier aktualiosiert ist valueToTranfser =0, dann ist old eintrag 0
          this.db.doc<User>(`users/${user.uid}`).update({userVisitedMeCounterOld: this.appCompo.valueToTransfer});
          return this.db.doc<User>(`users/${user.uid}`).valueChanges()
        } else {
          return of(null)
        }
      })
    ).subscribe(data => {
      if(data) {
        //console.log("joa");
      } else {
        return of(null)
      }
      }, error => {
        //console.log(error);
      }));

    this.appCompo.getMyProfileVisitors();

  }


  getMyProfileVisitors() {

    // find all userIds who visited me
    this.afAuth.authState.subscribe(user => {
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


        // get all userData of User visited me
        this.userVisitsObservable.subscribe(userVisits => {

//alle ids in array speichern
          let userVisitedMeIDs = [];


          for (let userVisit of userVisits) {
            // + time here..
            userVisitedMeIDs.push(userVisit.userVisitMe_id);
            this.userVisitedMeIDAndTime.push( [userVisit.userVisitMe_id, userVisit.visitTime]);
          }

          this.userCollection = this.db.collection('users'); //neue collection
          this.users = this.userCollection.valueChanges(); // referenz für alle users

          this.users.subscribe(allUsers => {
            for (let user of allUsers) {

              // wenn id drinne ist returnt true
              if(userVisitedMeIDs.includes(user.uid))
              {
                this.visiterTime(user.uid);

                this.userVisitedMe.push([
                  user.uid,
                  user.displayName,
                  this.calculateAge(user.birthdate),
                  user.url,
                  user.country,
                  this.getOccurrence(userVisitedMeIDs, user.uid),
                  this.visiterTime(user.uid)
                ])
              }
            }
          })
            console.log(this.userVisitedMe);
        });
      } else {
        return of(null)
      }
     });
  }

  getOccurrence(array, value) {
    return array.filter((v) => (v === value)).length;
  }

  visiterTime(userID){
    for (let user of this.userVisitedMeIDAndTime) {
      if(userID == user[0]) {
        let timestamp = user[1].toDate().getTime();
        const timeAgo = moment(timestamp).fromNow();
        return timeAgo;
      }
    }

  }

  calculateAge(bDay){
    let birthDate = bDay.toDate().getTime();
    let timeNow = new Date().getTime();
    let ageDifMs = timeNow - birthDate;
    let ageDate = new Date(ageDifMs);
    return (Math.abs(ageDate.getUTCFullYear() - 1970));
  }

  userIDinArray(userID: string) {
    if (this.userIamFollowingID.includes(userID))
    {
      return true;
    } else {
      return false;
    }
    return true;
  }

  getUserIamFollowing() {
    this.afAuth.authState.subscribe(user => {
      if(user) {
        this.userFollowCollection = this.db.collection('userToFollow');
        this.myId = user.uid;
        this.userFollows = this.userFollowCollection.snapshotChanges().map(actions => {
        return actions.map(a => {
        const data = a.payload.doc.data() as UserFollow;
        const id = a.payload.doc.id;
        return { id, ...data };
        });
        });

        this.userFollows.subscribe(userFollows => {
            for (let userFollow of userFollows) {
              this.userIamFollowingID.push(userFollow.userToFollow_id);
              this.userIamFollowingAll.push(userFollow);
            }
        });

      } else {
        return of(null)
      }
     });
  }

  removeUser(userID:string) {
    for (let userFollowInfos of this.userIamFollowingAll) {
      if(userFollowInfos.userToFollow_id == userID) {
        this.db.doc (`userToFollow/${userFollowInfos.id}`).delete();
      }
    }
    this.userIamFollowingID =[];
  }

  followUser(id:string){
    let data: UserFollow = {
      user_id: this.myId,
      userToFollow_id: id,
    }


    this.userFollowCollection = this.db.collection<UserFollow>('userToFollow');
    this.userFollowCollection.add(data);
  }





  goToUser(id: string, name: string)
  {
    this.router.navigate(['/profile/', id , name]);
  }


  ngOnDestroy() {

    console.log("überflüssig???");
    
    this.fbSubs.forEach( sub => sub.unsubscribe());
  }


}
