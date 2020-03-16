import { Component, OnInit } from '@angular/core';
import { trigger,state,style,animate,transition,} from '@angular/animations';
import {ActivatedRoute} from '@angular/router';
import { User } from '../../models/user.model';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, startWith, map} from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {StartConversationComponent} from './start-conversation/start-conversation.component';
import { DbQueriesComponent } from '../../db-queries/db-queries.component';
import { ConversationData } from '../../models/conversationData.model';
import { UserPicture } from '../../models/userPicture.model';
import { ToVisit } from '../../models/toVisit.model';
import { UserVisit } from '../../models/userVisit.model';
import {ReportUserComponent} from './report-user/report-user.component';
import {RequestPhotoComponent} from './request-photo/request-photo.component';



// export interface ToVisit {
//   dataArray: any [];
//   user_id?: string;
// }

// interface userPicture {
//   user_id: string;
//   filePath: string;
//   url_image: string;
//   public?: boolean;
//   private?: boolean;
// }


// export interface UserVisit {
//   id?: string;
//   my_id: string;
//   userVisitMe_id: string;
//   visitTime?: Date;
// }





@Component({
  selector: 'app-others-profile',
  templateUrl: './others-profile.component.html',
  styleUrls: ['./others-profile.component.css'],
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


@Injectable()
export class OthersProfileComponent implements OnInit {


  private userVisitCollection: AngularFirestoreCollection<UserVisit>;


  private chatTabelle: AngularFirestoreCollection<ConversationData>;
  private userCollection: AngularFirestoreCollection<User>;
  userData: Observable<User[]>;
  bDay;
  showVisits = false;
  private visitCollection: AngularFirestoreCollection<ToVisit>;
  visits: Observable<ToVisit[]>;
  userVisits: Observable<ToVisit[]>;
  private pictureCollection: AngularFirestoreCollection<UserPicture>;
  userPics: Observable<UserPicture[]>;
  isUser = false;
  myID;
  chatIDD;

  authUserID = "";
  private fbSubs: Subscription[] = [];

  user: Subscription;
  test: boolean;

  private receivers: any = [];
  private owners: any = [];

  notChatDefinied1: boolean;
  notChatDefinied2: boolean;
  ownerB: boolean;
  receiverB: boolean;

  constructor(
    private _route:ActivatedRoute,
    private db: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router,
    public dialog: MatDialog,
    private dbQueries: DbQueriesComponent
    ) {}

  ngOnInit() {

    this.fbSubs.push(this.afAuth.authState.subscribe(user => {
      this.loadData();
      if(user) {
        this.authUserID = user.uid;
        if (user.uid == this._route.snapshot.params['id'] )
        {
          this.isUser = true
        } else {
          let data: UserVisit = {
            my_id: this._route.snapshot.params['id'],
            userVisitMe_id: user.uid,
            visitTime: (new Date())
          }
          this.userVisitCollection = this.db.collection<UserVisit>('userToVisit');
          this.userVisitCollection.add(data);
        }
      } else {
        return (null)
      }
    }));
    this.getUserWantToVisits();
    this.getUserPicsData();
    this.afAuth.authState.subscribe(user => {
     this.userCollection = this.db.collection('users', ref => {
       return ref.where('uid', '==', this._route.snapshot.params['id'])
     });
    this.userData = this.userCollection.snapshotChanges().map(actions => {
    return actions.map(a => {
    const data = a.payload.doc.data() as User;
   // console.log(data.birthdate);
   // this.bDay = this.calculateAge(data.birthdate);
    const bDay = this.dbQueries.calculateAge(data.birthdate);
    const id = a.payload.doc.id;
    return { id, bDay, ...data };
    });
    });
    });
    //console.log("id to visit " + this._route.snapshot.params['id']);
    //console.log(this._route.snapshot.params['name']);
    setTimeout(() =>  { this.loadData()} , 200);
  }


  async loadData() {
    this.dbQueries.getChats(this.authUserID);

    //wenn überhaupt chats mit eigener id exisitiert..

    //
    this.dbQueries.chats.subscribe(datas => {
       if(typeof datas != "undefined" && datas != null && datas.length != null && datas.length > 0) {
         this.notChatDefinied1 = false;
        this.receivers =[];
         for (let data of datas) {
           this.receivers.push(data.receiver_id, data.chatID)
         }
       } else {
         this.notChatDefinied1 = true;
       }
       if(typeof this.receivers != "undefined" && this.receivers != null && this.receivers.length != null && this.receivers.length > 0) {
         this.receiverB = true;
       } else {
         this.receiverB = false;
       }

       console.log("true1 " + this.notChatDefinied1);
       console.log("receiver b " + this.receiverB)
    })


    //chats mit receiver id exisitertt??
    this.dbQueries.getChatsReceived(this.authUserID);
    this.dbQueries.chats2.subscribe(datas => {
       if(typeof datas != "undefined" && datas != null && datas.length != null && datas.length > 0) {
        this.notChatDefinied2 = false;
        this.owners =[];
         for (let data of datas) {
           this.owners.push(data.creator_id, data.chatID)
         }
       } else {
         this.notChatDefinied2 = true;
       }
       if(typeof this.owners != "undefined" && this.owners != null && this.owners.length != null && this.owners.length > 0) {
         this.ownerB = true;
       } else {
         this.ownerB = false;
       }

       console.log("true2 " + this.notChatDefinied2);
       console.log("ownerB " + this.ownerB)
    })





  }


    async startConversation(){

    this.dbQueries.getChats(this.authUserID);
    this.dbQueries.getChatsReceived(this.authUserID);

    this.fbSubs.push(this.dbQueries.chats.subscribe(datas => {
       if(typeof datas != "undefined" && datas != null && datas.length != null && datas.length > 0) {
        this.notChatDefinied1 = false;
        this.receivers =[];
         for (let data of datas) {
           this.receivers.push(data.receiver_id, data.chatID)
         }
       }
       else {
         this.notChatDefinied1 = true;
       }
    }));
    this.fbSubs.push(this.dbQueries.chats2.subscribe(datas => {
       if(typeof datas != "undefined" && datas != null && datas.length != null && datas.length > 0) {
        this.notChatDefinied2 = false;
        this.owners =[];
         for (let data of datas) {
           this.receivers.push(data.creator_id, data.chatID)
         }
       }
       else {
         this.notChatDefinied2 = true;
       }
    }));


    if(typeof this.owners != "undefined" && this.owners != null && this.owners.length != null && this.owners.length > 0) {
      if(this.owners.includes(this._route.snapshot.params['id'])) {
        let chatIDIndex = (this.getIndexOfReceiverArrayOwner(this._route.snapshot.params['id']) + 1);
        const chatid = this.owners[chatIDIndex];
        this.router.navigate([ '/conversations/inbox/', chatid]);
        this.ownerB = true;
      } else if(this.ownerB == true && this.receiverB == false) {
        this.dialog.open(StartConversationComponent, {data: {userToSendID: this._route.snapshot.params['id'] }});
      }
    }
    if(typeof this.receivers != "undefined" && this.receivers != null && this.receivers.length != null && this.receivers.length > 0) {
      if(this.receivers.includes(this._route.snapshot.params['id'])) {
        let chatIDIndex = (this.getIndexOfReceiverArray(this._route.snapshot.params['id']) + 1);
        const chatid = this.receivers[chatIDIndex];
        this.router.navigate([ '/conversations/sent/', chatid]);
        this.ownerB == true;
      } else if(this.ownerB == true && this.receiverB == true) {
        this.dialog.open(StartConversationComponent, {data: {userToSendID: this._route.snapshot.params['id'] }});
      }
    }
// für eigene ID exisitert noch kein chat..
    if((this.notChatDefinied1  && this.notChatDefinied2)) {
      this.dialog.open(StartConversationComponent, {data: {userToSendID: this._route.snapshot.params['id'] }});
    }

    // if(typeof this.receivers != "undefined" && this.receivers != null && this.receivers.length != null && this.receivers.length > 0) {
    //   if(this.receivers.includes(this._route.snapshot.params['id'])) {
    //     let chatIDIndex = (this.getIndexOfReceiverArray(this._route.snapshot.params['id']) + 1);
    //     const chatid = this.receivers[chatIDIndex];
    //     this.router.navigate([ '/conversations/sent/', chatid]);
    //   } else {
    //     this.dialog.open(StartConversationComponent, {data: {userToSendID: this._route.snapshot.params['id'] }});
    //   }
    // }

  }


  getIndexOfReceiverArrayOwner(receiverID) {
    for (let i =0; i < this.owners.length; i++ ) {
      if(receiverID == this.owners[i]) {
        return i;
      }
    }
  }
  getIndexOfReceiverArray(receiverID) {
    for (let i =0; i < this.receivers.length; i++ ) {
      if(receiverID == this.receivers[i]) {
        return i;
      }
    }
  }


  getUserWantToVisits() {

     this.visitCollection = this.db.collection('toVisit', ref => {
       return ref.where('user_id', '==', this._route.snapshot.params['id'])
     });
     this.userVisits = this.visitCollection.snapshotChanges().map(actions => {
       return actions.map(a => {
       if(a.payload.doc.id != null) {
         this.showVisits = true;
       }
       const data = a.payload.doc.data() as ToVisit;
       const id = a.payload.doc.id;
       return { id, ...data };
       });
       });


  }


  getUserPicsData() {

   this.pictureCollection = this.db.collection('userPictures', ref => {
     return ref.where('user_id', '==', this._route.snapshot.params['id'])
   });

   this.userPics = this.pictureCollection.snapshotChanges().map(actions => {
     return actions.map(a => {
     const data = a.payload.doc.data() as UserPicture;
     const id = a.payload.doc.id;
     return { id, ...data };
     });
     });

}


ngOnDestroy() {
    this.fbSubs.forEach( sub => sub.unsubscribe());
}


cancelSubscriptions() {
  //this.fbSubs.forEach( sub => sub.unsubscribe());
}


openReportUser() {
  this.dialog.open(ReportUserComponent);
}

openRequestPhoto() {
  this.dialog.open(RequestPhotoComponent);
}


}
