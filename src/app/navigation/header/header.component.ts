import { Component, OnInit, EventEmitter, Output, ElementRef, HostListener, Input } from '@angular/core';
import {AuthService} from '../../auth/auth.service';
import { AppComponent } from '../.././app.component';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, startWith, map} from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';
import { User } from '../../models/user.model';
import {ChatsComponent} from '../../chats/chats.component';

export interface UserVisit {
  id?: string;
  my_id: string;
  userVisitMe_id: string;
  visitTime: string;
}


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  private fbSubs: Subscription[] = [];
  private userVisitCollection: AngularFirestoreCollection<UserVisit>;
  private userVisitsObservable: Observable<UserVisit[]>;
  private userCollection: AngularFirestoreCollection<User>;
  counterUserVisitedMeOldDB = 0;
  counterUserVisitedMeCurrentDB =0;
    private users: Observable<User[]>;

  userVisitedMe = [] ;
  userVisitedMeIDAndTime = [];

  count = 0;

  userDisplayName: string;
  userUrl: string;
  userEmail: string;


 clickedInside1= false;
 clickedInside2= false;
 clickedInside3= false;
 visible = false;
 visible1= false;
 visible2= false;
 counterVis = 0;
 counterVis1 = 0;
 counterVis2 = 0;

 userReceiverAllData: any = [];

public premiumLocal: boolean;

clickInside3() {
this.clickedInside3 = true;
}

clickInside2() {
this.clickedInside2 = true;
}

clickInside1() {
this.clickedInside1 = true;
}

  @HostListener('document:click', ['$event'])
    clickout(event) {
      const target = event.target || event.srcElement || event.currentTarget;
      const idAttr = target.attributes.id;
      const dropdown3=  document.getElementById("dropdown3");
      const dropdown2=  document.getElementById("dropdown2");
      const dropdown1=  document.getElementById("dropdown1");
      const dropDownIdPopUp = document.getElementById("dropdown3popUp");
      if(target == dropdown3 )
      {
        this.counterVis++;
        if(this.counterVis == 1){
          this.visible = true;
        } else {
            this.visible = false;
            this.counterVis = 0;
        }
      } else if (this.clickedInside3 == false) {
        this.visible = false;
        this.counterVis = 0;
      }
      this.clickedInside3 = false;
      if (target == dropdown1)
      {
        this.counterVis1++;
        if(this.counterVis1 == 1){
          this.visible1 = true;
        } else {
            this.visible1 = false;
            this.counterVis1 = 0;
        }
      } else if (this.clickedInside1 == false) {
        this.visible1 = false;
        this.counterVis1 = 0;
      }
      this.clickedInside1 = false;
      if (target == dropdown2)
      {
        this.counterVis2++;
        if(this.counterVis2 == 1){
          this.visible2 = true;
        } else {
            this.visible2 = false;
            this.counterVis2 = 0;
        }
      } else if (this.clickedInside2 == false) {
        this.visible2 = false;
        this.counterVis2 = 0;
      }
      this.clickedInside2 = false;
    }
  @Output() sidenavToggle = new EventEmitter<void>();





  constructor( private authService: AuthService, private appCompo: AppComponent, private db: AngularFirestore, private afAuth: AngularFireAuth, private chat: ChatsComponent) { }

  ngOnInit() {
    this.getMyProfileVisitors();
    this.chat.loadInbox();
    this.userReceiverAllData = this.chat.userReceiverAllData;
    setTimeout(() =>  { this.test()} , 2000);

  }

  test(){

    this.userReceiverAllData = this.chat.userReceiverAllData;
    console.log(this.userReceiverAllData)
  }


  getMyProfileVisitors() {

    this.fbSubs.push(this.afAuth.authState.pipe(
     switchMap(user => {
       if(user) {
         return this.db.doc<User>(`users/${user.uid}`).valueChanges()
       } else {
         return of(null)
       }
     })
   ).subscribe(data => {
     if(data) {

       this.userEmail = data.email;
       this.userDisplayName = data.displayName
       this.userUrl = data.url;
       this.premiumLocal = data.premium;
       this.counterUserVisitedMeOldDB = data.userVisitedMeCounterOld;
       this.counterUserVisitedMeCurrentDB = data.userVisitedMeCounterCurrent;
     } else {
       return of(null)
     }
     }, error => {
     }));
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
        this.userVisitsObservable.subscribe(userVisits => {
          let userVisitedMeIDs = [];
          for (let userVisit of userVisits) {
            userVisitedMeIDs.push(userVisit.userVisitMe_id);
            this.userVisitedMeIDAndTime.push( [userVisit.userVisitMe_id, userVisit.visitTime]);
          }
          this.userCollection = this.db.collection('users');
          this.users = this.userCollection.valueChanges();
          this.users.subscribe(allUsers => {
            this.userVisitedMe = [];
            for (let user of allUsers) {
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
            this.count = this.userVisitedMe.length - this.counterUserVisitedMeOldDB;
          })
        });
      } else {
        return of(null)
      }
     });
  }
  onLogout() {
    this.authService.logout();
    this.appCompo.cancelSubscriptions();
    this.chat.cancelSubscriptions();
  }
  onToggleSidenav() {
    this.sidenavToggle.emit();
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
  getOccurrence(array, value) {
    return array.filter((v) => (v === value)).length;
  }
  ngOnDestroy() {
    this.fbSubs.forEach( sub => sub.unsubscribe());
  }




}
