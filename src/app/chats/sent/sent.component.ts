import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
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
import { Injectable } from '@angular/core';
import { TrashComponent } from '.././trash/trash.component';

@Component({
  selector: 'app-sent',
  templateUrl: './sent.component.html',
  styleUrls: ['./sent.component.css']
})
@Injectable()
export class SentComponent implements OnInit {

  user: Subscription;
  premiumLocal: boolean;
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
  noChatsYet=true;
  chatID: Observable<ConversationData>;
  private fbSubs: Subscription[] = [];
  private chatsCollection: AngularFirestoreCollection<ConversationData>;
  private chatsObservable: Observable<ConversationData[]>;
  private userCollection: AngularFirestoreCollection<User>;
  private users: Observable<User[]>;
  private chatDatas =[];
  public chat2: Observable<ConversationData[]>;
  private chatCollection: AngularFirestoreCollection<ConversationData>;
  lastChatId: string;
  public chatsReceived: Observable<ConversationData[]>;
  lastChatIdTrash: string;

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
    this.currentChatID =this._route.snapshot.params['id'];
    this.noChatsYet = true;
    this.premiumLocal = true;
    this.getChatID();
    this.isUserPremium();
    this.getUserReceiverData();
  }

  async initConversation() {
    const {uid} = await this.auth.getUser();
    this.dbQueries.getReceivedChatCollectionAsObservable(uid);
    this.chatsReceived = this.dbQueries.chatsReceived;
    this.lastChatId = "";
    //referenz zu-- trash compüonent und zugriff auf last id..

    this.trash.loadDeletedMessages();
    setTimeout(() =>  { this.loadLastChatID()} , 500);

    this.chatsReceived.subscribe( data => {
      if(typeof data != "undefined" && data != null && data.length != null && data.length > 0) {
        let lastElement = data.pop();
        this.lastChatId = lastElement.chatID;
      } else {
        this.lastChatId = "";
      }
    });
  }

  loadLastChatID(){
    if(typeof this.trash.userReceiverAllData != "undefined" && this.trash.userReceiverAllData != null && this.trash.userReceiverAllData.length != null && this.trash.userReceiverAllData.length > 0) {
      let lastElement = this.trash.userReceiverAllData[0];
      this.lastChatIdTrash = lastElement.chatID;
    //  console.log(  this.lastChatIdTrash);
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

  async getUserReceiverData() {
    let chatID = this._route.snapshot.params['id'];
    const {uid} = await this.auth.getUser();
    const {url} = await this.auth.getUser();
    this.myPicUrl = url;
    this.myID = uid;
    this.dbQueries.getChatCollectionAsObservable(uid);
    //loope über die selbst erstellen chats und speichere, receiverID, content & createdAt in einem neuen Array
    this.fbSubs.push(this.dbQueries.chats.subscribe(chatDatas => {


    if(typeof chatDatas != "undefined" && chatDatas != null && chatDatas.length != null && chatDatas.length > 0) {
      this.noChatsYet = false;
      this.chatDatas = [];
      for (let chatData of chatDatas) {
        if(chatData.creatorDeleted != true){
          this.chatDatas.push(chatData.receiver_id, chatData.content, chatData.created_at, chatData.chatID);
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
          }
        }
      }))
    }



  createMessage() {
    let chatID = this._route.snapshot.params['id'];
    this.dbQueries.insertContentIntoChat(this.message, this.myID, chatID);
    this.getChat(this.currentUserToWriteID, chatID);
    this.message ="";
    const config: ScrollToConfigOptions = {
      target: 'destination'
    };
    this._scrollToService.scrollTo(config);
  }


  getChat(receiverID: string, chatID: string) {
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



    this.router.navigate(['/conversations/sent', chatID]);

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
    this.chat2 = this.chatCollection.snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as ConversationData;
        const id = a.payload.doc.id;
        this.receiverData(data.receiver_id)
        return { id, ...data };
        });
      });
    }
  }

  deleteMessage(userChatID: string){

    console.log("asdasd")
    this.db.doc<ConversationData>(`chats/${userChatID}`).update({creatorDeleted:true });
    this.router.navigate(['/conversations/trash', userChatID]);
  }



  async ngOnDestroy() {
    if(this._route.snapshot.params['id'] != null) {
      const {content} = await this.getChatDocument();
        if(typeof content != "undefined" && content != null && content != null && content.length > 0)
        {
        }else {
           this.db.doc (`chats/${this._route.snapshot.params['id']}`).delete();
        }
    }
    this.fbSubs.forEach( sub => sub.unsubscribe());
  }

}
