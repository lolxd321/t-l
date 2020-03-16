import { Component, OnInit,Input, Injectable} from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import { switchMap, startWith, map, first} from 'rxjs/operators';
import { User } from '../../models/user.model';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../.././auth/auth.service';
import {ActivatedRoute} from '@angular/router';
import { ConversationData } from '../../models/conversationData.model';
import * as moment from 'moment';
import { _ } from 'underscore';
import { DbQueriesComponent } from '../../db-queries/db-queries.component';
import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to';

@Component({
  selector: 'app-trash',
  templateUrl: './trash.component.html',
  styleUrls: ['./trash.component.css']
})

@Injectable()
export class TrashComponent implements OnInit {

  private fbSubs: Subscription[] = [];
  private chatsCollection: AngularFirestoreCollection<ConversationData>;
  private chatsObservable: Observable<ConversationData[]>;
  private userCollection: AngularFirestoreCollection<User>;
  private users: Observable<User[]>;
  private chatDatas =[];
  public chat2: Observable<ConversationData[]>;
  public baum3: Observable<ConversationData[]>;
  public chat4: Observable<ConversationData[]>;
  private chatCollection: AngularFirestoreCollection<ConversationData>;
  public chatsReceived: Observable<ConversationData[]>;
  lastChatIdSent: string;
  lastChatIdInbox: string;
  premiumLocal: boolean;
  user: Subscription;
  contentChat: [];
  public userReceiverAllData: any = [];
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

  notDeletedMesssage1: boolean;
  notDeletedMesssage2: boolean;


loadedCharacter: {};
  constructor(
    private db: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router,
    private auth: AuthService,
    private _route:ActivatedRoute,
    private dbQueries: DbQueriesComponent,
    private _scrollToService: ScrollToService) { }


  ngOnInit() {
    this.currentChatID =this._route.snapshot.params['id'];
    this.premiumLocal = false;
    this.initConversation();
    this.isUserPremium();
    this.loadDeletedMessages();
    this.getChatID();

    this.notDeletedMesssage1 = true;
    this.notDeletedMesssage2 = true;

  }



  chatsThere() {
    // console.log("1 " + this.notDeletedMesssage1);
    // console.log("2 " + this.notDeletedMesssage2)
    // if(this.notDeletedMesssage1 && this.notDeletedMesssage2) {
    //   this.noChatsYet = true;
    // }

  //  console.log(this.chatDatas);

    // if(typeof this.chatDatas != "undefined" && this.chatDatas != null && this.chatDatas.length != null && this.chatDatas.length > 0)
    // {
    //   this.noChatsYet = false;
    // } else {
    //   this.noChatsYet = true;
    // }

    if(typeof this.chatDatas != "undefined" && this.chatDatas != null && this.chatDatas.length != null && this.chatDatas.length > 0)
    {
      this.noChatsYet = false;
    }else{
      this.noChatsYet = true;
    }
  }



  async loadDeletedMessages(){
    let chatID = this._route.snapshot.params['id'];
    const {uid} = await this.auth.getUser();
    const {url} = await this.auth.getUser();
    this.myPicUrl = url;
    this.myID = uid;

    this.dbQueries.getReceivedChatCollectionAsObservable(uid);
    this.dbQueries.getChatCollectionAsObservable(uid);

    this.chatDatas = [];

    //received..
    this.dbQueries.chatsReceived.subscribe(chatDatas => {
    if(typeof chatDatas != "undefined" && chatDatas != null && chatDatas.length != null && chatDatas.length > 0) {
      this.notDeletedMesssage1 = false;
      this.getSingleChatDatasForInit();
      this.chatsThere();
      this.initConversation();
      for (let chatData of chatDatas) {
        if(chatData.receiverDeleted == true ){
          this.chatDatas.push(chatData.creator_id, chatData.content, chatData.created_at, chatData.chatID);
        }
        if(chatDatas.length == 1) {
          this.notDeletedMesssage1 = true;
        }
      }
      } else {
        this.notDeletedMesssage1 = true;
      }

    });

    // self created chats..
  this.dbQueries.chats.subscribe(chatDatas => {
    if(typeof chatDatas != "undefined" && chatDatas != null && chatDatas.length != null && chatDatas.length > 0) {
      this.notDeletedMesssage1 = false;
      this.getSingleChatDatasForInit();
      this.chatsThere();
      this.initConversation();
      for (let chatData of chatDatas) {
        if(chatData.creatorDeleted == true){
          this.chatDatas.push(chatData.receiver_id, chatData.content, chatData.created_at, chatData.chatID);
        }
      }
    } else {
      this.notDeletedMesssage2 = true;
    }
  });
  this.dbQueries.getAllUsers();
  this.fbSubs.push(this.dbQueries.users.subscribe(allUsers => {
    this.chatsThere();
    this.initConversation();
    const userDatas = [];
      for (let user of allUsers) {
        if(this.chatDatas.includes(user.uid)) {
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

        }
      }
  }))
  }



  getChat(receiverID: string, chatID: string) {

    this.currentChatID =this._route.snapshot.params['id'];

    this.chatCollection = this.db.collection('chats', ref => {
      return ref.where('chatID', '==', chatID);
    });

    this.chat2 = this.chatCollection.snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as ConversationData;
        const id = a.payload.doc.id;
        return { id, ...data };
        });
      });

    this.router.navigate(['/conversations/trash', chatID]);

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
    return timeAgo;
  }

  async getChatID() {
    this.chatID = await this.db.doc<ConversationData>(`chats/${this._route.snapshot.params['id']}`).valueChanges();
  }

  async isUserPremium(){
    const {premium} = await this.auth.getUser();
    this.premiumLocal = premium;
  }

  async ngOnDestroy() {
    this.fbSubs.forEach( sub => sub.unsubscribe());
  }

  async initConversation() {
    const {uid} = await this.auth.getUser();
    this.chatCollection = this.db.collection('chats', ref => {
      return ref.where('creator_id', '==', uid).orderBy('created_at');
    });
    this.baum3 = this.chatCollection.snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as ConversationData;
        const id = a.payload.doc.id;
        return { id,  ...data };
        });
      });
    this.lastChatIdSent = "";
    this.fbSubs.push(this.baum3.subscribe( data => {
      if(typeof data != "undefined" && data != null && data.length != null && data.length > 0) {
        for (let chatData of data) {
          if(chatData.creatorDeleted != true){
            this.lastChatIdSent =chatData.chatID;
          }
        }
      } else {
        this.lastChatIdSent = "";
      }
    }));

    this.dbQueries.getReceivedChatCollectionAsObservable(uid);
    this.chatsReceived = this.dbQueries.chatsReceived;
    this.lastChatIdInbox = "";
    this.chatsReceived.subscribe( data => {
      if(typeof data != "undefined" && data != null && data.length != null && data.length > 0) {
        let lastElement = data.pop();
        this.lastChatIdInbox = lastElement.chatID;
      } else {
        this.lastChatIdInbox = "";
      }
    });
  }


  async getSingleChatDatasForInit() {



    let chatID = this._route.snapshot.params['id'];


    if(typeof chatID != "undefined" && chatID != null && chatID.length != null && chatID.length > 0) {
    this.chatCollection = this.db.collection('chats', ref => {
      return ref.where('chatID', '==', chatID);
    });
    this.chat2 = this.chatCollection.snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as ConversationData;
        const id = a.payload.doc.id;

        if(data.creatorDeleted) {
            this.receiverData(data.receiver_id);
        } else {
          this.receiverData(data.creator_id);
        }
        return { id, ...data };
        });
      });
    }
    //if creator...
    // if receiver..
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

  restore() {


    let chatID = this._route.snapshot.params['id'];

    if(typeof chatID != "undefined" && chatID != null && chatID.length != null && chatID.length > 0) {
    this.chatCollection = this.db.collection('chats', ref => {
      return ref.where('chatID', '==', chatID);
    });

    this.chat4 = this.chatCollection.snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as ConversationData;
        const id = a.payload.doc.id;
        return { id, ...data };
        });
      });
    }

    this.fbSubs.push(this.chat4.subscribe(data  => {

      if(data)  {
        if (data[0].creatorDeleted == true ) {
          this.db.doc<ConversationData>(`chats/${chatID}`).update({creatorDeleted:false });
          this.router.navigate(['/conversations/sent', chatID]);
        }else if(data[0].receiverDeleted == true) {
          this.db.doc<ConversationData>(`chats/${chatID}`).update({receiverDeleted:false });
          this.router.navigate(['/conversations/inbox', chatID]);
        }
      }

    }));

}




}
