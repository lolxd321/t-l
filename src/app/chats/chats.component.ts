import { Component, OnInit } from '@angular/core';
import { trigger,state,style,animate,transition,} from '@angular/animations';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { switchMap, startWith, map, first} from 'rxjs/operators';
import { User } from '../models/user.model';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '.././auth/auth.service';
import {ActivatedRoute} from '@angular/router';
import { ConversationData } from '../models/conversationData.model';
import * as moment from 'moment';
import { _ } from 'underscore';
import { DbQueriesComponent } from '../db-queries/db-queries.component';
import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to';
import { Injectable } from '@angular/core';
import { TrashComponent } from './trash/trash.component';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.css']
})

@Injectable()
export class ChatsComponent implements OnInit {

  lastChatId: string;
  user: Subscription;
  premiumLocal = false;
  contentChat: [];
  userReceiverAllData: any = [];
  singleChatContent:any = [];
  currentUserToWriteName: string;
  currentUserToWriteCountry: string;
  currentUserToWriteUrl: string;
  currentUserToWriteAge: number;
  currentUserToWriteID: string;
  currentChatID: string;
  message: string;
  myID: string;
  myPicUrl: string;
  noChatsYet: boolean;
  chatID: Observable<ConversationData>;
  private fbSubs: Subscription[] = [];
  private chatsCollection: AngularFirestoreCollection<ConversationData>;
  private chatsObservable: Observable<ConversationData[]>;
  private userCollection: AngularFirestoreCollection<User>;
  private users: Observable<User[]>;
  private chatDatas =[];
  private chatDatas2 =[];
  public baum: Observable<ConversationData[]>;
  public baum2: Observable<ConversationData[]>;
  private chatCollection: AngularFirestoreCollection<ConversationData>;
  lastChatIdTrash: string;
  isAdminChat = false;
  public chatsReceived2: Observable<ConversationData[]>;
  private chatCollectionReceived2: AngularFirestoreCollection<ConversationData>;
  private chatCollectionReceived: AngularFirestoreCollection<ConversationData>;
  public chatsReceived: Observable<ConversationData[]>;

  constructor(
    private db: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router,
    private auth: AuthService,
    private _route:ActivatedRoute,
    private dbQueries: DbQueriesComponent,
    private _scrollToService: ScrollToService,
    private trash: TrashComponent) { }

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
    if (user) {
        this.db.doc<User>(`users/${user.uid}`).update({lastActivity: Date.now() });
    }
    });

      this.currentChatID =this._route.snapshot.params['id'];
      this.noChatsYet = false;
      this.loadInbox();
      this.getChatID();
      this.isUserPremium();
      this.loadInbox();
  }



  async initConversation() {
    const {uid} = await this.auth.getUser();
    this.chatCollection = this.db.collection('chats', ref => {
      return ref.where('creator_id', '==', uid).orderBy('created_at');
    });
    this.baum2 = this.chatCollection.snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as ConversationData;
        const id = a.payload.doc.id;
        return { id,  ...data };
        });
      });
    this.lastChatId = "";

    this.trash.loadDeletedMessages();
    setTimeout(() =>  { this.loadLastChatID()} , 500);


    this.fbSubs.push(this.baum2.subscribe( data => {
      if(typeof data != "undefined" && data != null && data.length != null && data.length > 0) {
        for (let chatData of data) {
          if(chatData.creatorDeleted != true){
            this.lastChatId =chatData.chatID;
          }
        }
      } else {
        this.lastChatId = "";
      }
    }));
  }

  loadLastChatID(){
    if(typeof this.trash.userReceiverAllData != "undefined" && this.trash.userReceiverAllData != null && this.trash.userReceiverAllData.length != null && this.trash.userReceiverAllData.length > 0) {
      let lastElement = this.trash.userReceiverAllData[0];
      this.lastChatIdTrash = lastElement.chatID;
      console.log(  this.lastChatIdTrash);
    }else {
      this.lastChatIdTrash ="";
    }
  }



  checkIfChatExisit(){
    if(typeof this.chatDatas != "undefined" && this.chatDatas != null && this.chatDatas.length != null && this.chatDatas.length > 0) {
    } else {
      this.noChatsYet = true;
    }
  }

  async loadInbox(){
    let chatID = this._route.snapshot.params['id'];
    const {uid} = await this.auth.getUser();
    const {url} = await this.auth.getUser();
    this.myPicUrl = url;
    this.myID = uid;


    this.chatCollectionReceived = this.db.collection('chats', ref => {
      return ref.where('receiver_id', '==', uid).orderBy('created_at');
    });
    // nach crated at sortieren..
    this.chatsReceived = this.chatCollectionReceived.snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as ConversationData;
        const id = a.payload.doc.id;
        return { id,  ...data };
        });
      });


    this.fbSubs.push(this.chatsReceived.subscribe(chatDatas => {


    if(typeof chatDatas != "undefined" && chatDatas != null && chatDatas.length != null && chatDatas.length > 0) {
      this.chatDatas = [];
      for (let chatData of chatDatas) {
        if(chatData.receiverDeleted != true){
          this.chatDatas.push(chatData.creator_id, chatData.content, chatData.created_at, chatData.chatID);
        }
      }

    this.checkIfChatExisit();
    this.dbQueries.getAllUsers();
    this.fbSubs.push(this.dbQueries.users.subscribe(allUsers => {
    this.loadLastChatID();
    this.getSingleChatDatasForInit();
    this.initConversation();
    const userDatas = [];
      for (let user of allUsers) {

        // ist aktuell eigene?? muss eigentlich receiver id sein..
        if(this.chatDatas.includes(user.uid)) {

        //console.log(this.chatDatas)
          let chatDataContentIndex = (this.getIndexOfUserID(user.uid) + 1);
          let chatDataTimeIndex = (this.getIndexOfUserID(user.uid) + 2);
          let chatDataIdIndex = (this.getIndexOfUserID(user.uid) + 3);
          let chatDataCreatedAtTimeStamp = this.chatDatas[chatDataTimeIndex];
          let chatDataCreatedAtHumanReadable = this.calculateTime(chatDataCreatedAtTimeStamp);



          userDatas.push({
           userID: user.uid,
           userName:user.displayName,
           age: this.auth.calculateAge(user.birthdate),
           picUrl: user.url,
           country: user.country,
           messages: this.chatDatas[chatDataContentIndex],
           date: chatDataCreatedAtTimeStamp,
           dateHuman:chatDataCreatedAtHumanReadable,
           chatID: this.chatDatas[chatDataIdIndex]
         });

         this.userReceiverAllData = _.sortBy ( userDatas, 'date').reverse();

         //console.log(userDatas)

        }
      }
    }))
  } else {
    this.noChatsYet = true;
  }
  }));
  }

    receiverData (receiverid) {
      this.dbQueries.getAllUsers();
      this.fbSubs.push(this.dbQueries.users.subscribe(allUsers => {
        for (let user of allUsers) {
          if(user.uid == receiverid) {
            this.currentUserToWriteID = user.uid;
            this.currentUserToWriteName = user.displayName;
            this.currentUserToWriteCountry = user.country;
            this.currentUserToWriteUrl = user.url;
            this.currentUserToWriteAge = this.auth.calculateAge(user.birthdate)
            if(receiverid == "STh55LXVPweLZ9I61nsZT9Y05K93") {
              this.isAdminChat = true;
            }else {
              this.isAdminChat = false;
            }
          }
        }
      }));
    }

  createMessage() {
    let chatID = this._route.snapshot.params['id'];
    this.dbQueries.insertContentIntoChat(this.message, this.myID, chatID);
    this.getChat(this.currentUserToWriteID, chatID);
    this.message ="";
    const config: ScrollToConfigOptions = {target: 'destination'};
    this._scrollToService.scrollTo(config);
  }


  getChat(receiverID: string, chatID: string) {
    this.currentChatID =this._route.snapshot.params['id'];


    this.chatCollection = this.db.collection('chats', ref => {
      return ref.where('chatID', '==', chatID);
    });

    this.baum = this.chatCollection.snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as ConversationData;
        const id = a.payload.doc.id;
        return { id, ...data };
        });
      });

    this.router.navigate(['/conversations/inbox', chatID]);

    for ( let chatData of this.userReceiverAllData) {
      if(chatData.userID == receiverID)
      {
        this.currentUserToWriteID = chatData.userID;
        this.currentUserToWriteName = chatData.userName;
        this.currentUserToWriteCountry = chatData.country;
        this.currentUserToWriteUrl = chatData.picUrl;
        this.currentUserToWriteAge = chatData.age;
        this.currentChatID = chatData.chatID;
      }
    }
    if(receiverID == "STh55LXVPweLZ9I61nsZT9Y05K93") {
      this.isAdminChat = true;
    } else {
      this.isAdminChat = false;
    }
  }




  getIndexOfUserID(userID) {
    for (let i =0; i < this.chatDatas.length; i++ ) {
      if(userID == this.chatDatas[i]) {
        return i;
      }
    }
  }

  calculateTime(chatCreatedAtTimeStamp) {
    const timeAgo = moment(chatCreatedAtTimeStamp.toDate().getTime()).fromNow();
    //const timeAgo = Math.floor((Math.random() * 10) + 1);
    return timeAgo;
  }

  async getChatID() {
    this.chatID = await this.db.doc<ConversationData>(`chats/${this._route.snapshot.params['id']}`).valueChanges();
  }

  async isUserPremium(){
    const {premium} = await this.auth.getUser();
    this.premiumLocal = premium;
  }

  getChatDocument() {
    return this.chatID.pipe(first()).toPromise();
  }

   async getSingleChatDatasForInit() {


    let chatID = this._route.snapshot.params['id'];
    if(typeof chatID != "undefined" && chatID != null && chatID.length != null && chatID.length > 0) {

    this.chatCollection = this.db.collection('chats', ref => {

      return ref.where('chatID', '==', chatID);
    });
    this.baum = this.chatCollection.snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as ConversationData;
        const id = a.payload.doc.id;
        this.receiverData(data.creator_id);
        return { id, ...data };
        });
      });
    }
  }




  async ngOnDestroy() {

    if(this._route.snapshot.params['id'] != null) {
      const {content} = await this.getChatDocument();
        if(typeof content != "undefined" && content != null && content != null && content.length > 0)
        {
          console.log("array exists and is not empty")
        }else {
           this.db.doc (`chats/${this._route.snapshot.params['id']}`).delete();
        }
    }
    this.fbSubs.forEach( sub => sub.unsubscribe());
    this.lastChatId = "";
  }

  cancelSubscriptions() {
    this.fbSubs.forEach( sub => sub.unsubscribe());
    this.lastChatId = "";
    this.userReceiverAllData = [];
    this.currentUserToWriteID = "";
    this.currentUserToWriteName = "";
    this.currentUserToWriteCountry = "";
    this.currentUserToWriteUrl = "";
    this.currentUserToWriteAge = 0;
    this.currentChatID = "";
  }


  deleteMessage(userID: string, userChatID: string){
    this.db.doc<ConversationData>(`chats/${userChatID}`).update({receiverDeleted:true });
    this.router.navigate(['/conversations/trash', userChatID]);
  }


}
