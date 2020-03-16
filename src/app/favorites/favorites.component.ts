import { Component, OnInit } from '@angular/core';
import { trigger,state,style,animate,transition,} from '@angular/animations';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, startWith, map} from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { User } from '../models/user.model';


export interface UserFollow {
  id?: string;
  user_id: string;
  userToFollow_id: string;
}


@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css'],
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

export class FavoritesComponent {

  private userCollection: AngularFirestoreCollection<User>;
  userData: Observable<User[]>;
  userFollows: Observable<UserFollow[]>;
  private userFollowCollection: AngularFirestoreCollection<UserFollow>;
  bDay;
  spinner = true;
  myId = "";
  userIamFollowingID=[];
  userIamFollowingAll=[];



  constructor(private db: AngularFirestore, private afAuth: AngularFireAuth, private router: Router) {}

  ngOnInit() {
    this.getAllUserData();


    // in db.. time stamp von grad rein..



    this.afAuth.authState.subscribe(user => {
      if(user) {

        this.db.doc<User>(`users/${user.uid}`).update({lastActivity: Date.now() });


        this.myId = user.uid;
        this.userFollowCollection = this.db.collection('userToFollow');

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

  getAllUserData(){
     this.afAuth.authState.subscribe(user => {

     //zugriff auif alle users
     this.userCollection = this.db.collection('users');

     this.userData = this.userCollection.snapshotChanges().map(actions => {
     return actions.map(a => {
     const data = a.payload.doc.data() as User;

     const bDay = this.calculateAge(data.birthdate);
     const id = a.payload.doc.id;
     return { id, bDay, ...data };
     });
     });

     this.spinner = false;
     });
  }

  calculateAge(bDay){
    let birthDate = bDay.toDate().getTime();
    let timeNow = new Date().getTime();
    let ageDifMs = timeNow - birthDate;
    let ageDate = new Date(ageDifMs);
    return (Math.abs(ageDate.getUTCFullYear() - 1970));
  }

  goToUser(id: string, name: string)
  {
    this.router.navigate(['/profile/', id , name]);
  }

  userIDinArray(userID: string) {
    if (this.userIamFollowingID.includes(userID))
    {
      return true;
    } else {
      return false;
    }
  }

  followUser(id:string){
    let data: UserFollow = {
      user_id: this.myId,
      userToFollow_id: id,
    }
    this.userFollowCollection = this.db.collection<UserFollow>('userToFollow');
    this.userFollowCollection.add(data);
  }


  removeUser(userID:string) {
    for (let userFollowInfos of this.userIamFollowingAll) {
      if(userFollowInfos.userToFollow_id == userID) {
        this.db.doc (`userToFollow/${userFollowInfos.id}`).delete();
      }
    }
    this.userIamFollowingID =[];
  }

}
