import { Component, OnInit } from '@angular/core';
import { trigger,state,style,animate,transition,} from '@angular/animations';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, startWith, map} from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { ToVisit } from '../../models/toVisit.model';
import {AppComponent } from '../../app.component';
import {FormControl} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CountriesService } from '../../dropdown/countries.service';
import { Subscription } from 'rxjs';
import { ConversationData } from '../../models/conversationData.model';
import { DbQueriesComponent } from '../../db-queries/db-queries.component';
import { firestore } from 'firebase/app';

export interface UserVisit {
  id?: string;
  my_id: string;
  userVisitMe_id: string;
  visitTime: string;
}
@Component({
  selector: 'app-fakes',
  templateUrl: './fakes.component.html',
  styleUrls: ['./fakes.component.css']
})
export class FakesComponent implements OnInit {

  private userCollectionReal: AngularFirestoreCollection<User>;
  private usersReal: Observable<User[]>;
  private userCollectionFake: AngularFirestoreCollection<User>;
  private userCollectionSingel: AngularFirestoreCollection<User>;
  private userCollectionSingelReal: AngularFirestoreCollection<User>;

  private chatCollection: AngularFirestoreCollection<ConversationData>;
  private chatCollection5: AngularFirestoreCollection<ConversationData>;

  public chats: Observable<ConversationData[]>;
  public chat: Observable<ConversationData[]>;

  private usersFake: Observable<User[]>;

  private userFake: Observable<User[]>;
  private userReal: Observable<User[]>;

  private userVisitCollection: AngularFirestoreCollection<UserVisit>;
  private userVisitsObservable: Observable<UserVisit[]>;

  message: string;
  fakeUserUrl: string;
  fakeUserDisplayName: string;

  realUserUrl: string;
  realUserDisplayName: string;

  fakeUserUid:string;
  realUserUid:string;
  chatID: string;

  chatAlreadyExist: boolean;

  usersVisitedMe = [];

  constructor(private appCompo: AppComponent, private db: AngularFirestore, private afAuth: AngularFireAuth, private router: Router,private dbQueries: DbQueriesComponent) {}

  ngOnInit() {

    this.chatAlreadyExist = false;
    this.userCollectionFake = this.db.collection('users', ref => {
        return ref.where('fake', '==', true)
    });
    this.usersFake = this.userCollectionFake.valueChanges();

    this.userCollectionReal = this.db.collection('users', ref => {
        return ref.where('gender', '==', 'Male')
    });
    this.usersReal = this.userCollectionReal.valueChanges();

  }

  selectFakeAccount(fakeUserID){
    this.fakeUserUid =fakeUserID;
    this.userCollectionSingel = this.db.collection('users', ref => {
        return ref.where('uid', '==', fakeUserID)
    });

    this.userFake = this.userCollectionSingel.valueChanges();
    this.userFake.subscribe(data => {
      if(data){
        this.fakeUserUrl = data[0].url;
        this.fakeUserDisplayName = data[0].displayName;
      }
    })

    this.getConversation();
    this.getProfileVisitors();
  }


  getProfileVisitors(){
    this.userVisitCollection = this.db.collection('userToVisit', ref => {
      return ref.where('my_id', '==', this.fakeUserUid)
    });
    this.userVisitsObservable = this.userVisitCollection.snapshotChanges().map(actions => {
      return actions.map(a => {
      const data = a.payload.doc.data() as UserVisit;
      const id = a.payload.doc.id;
      return { id, ...data };
      });
    });

    this.userVisitsObservable.subscribe(userVisits => {
      if (userVisits) {
        this.usersVisitedMe = [];

        for(let data of userVisits){
          this.usersVisitedMe.push(data.userVisitMe_id)
        }


      }
    })
  }


  selectRealAccount(realUserID){
    this.realUserUid =realUserID;
    this.userCollectionSingelReal = this.db.collection('users', ref => {
        return ref.where('uid', '==', realUserID)
    });
    this.userReal = this.userCollectionSingelReal.valueChanges();
    this.userReal.subscribe(data => {
      if(data){
        this.realUserUrl = data[0].url;
        this.realUserDisplayName = data[0].displayName;
      }
    })
    this.getConversation();
  }


  getConversation(){
    this.chatCollection = this.db.collection('chats', ref => {
      return ref.where('creator_id', '==', this.fakeUserUid).orderBy('created_at');
    });
    this.chats = this.chatCollection.snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as ConversationData;
        const id = a.payload.doc.id;
        return { id,  ...data };
        });
      });



    if(this.realUserUid != null){

      this.chats.subscribe(datas => {

        if(typeof datas != "undefined" && datas != null && datas.length != null && datas.length > 0) {
          for(let data of datas) {
            if(data.receiver_id == this.realUserUid)
            {
              this.chatAlreadyExist = true;
              this.chatID = data.chatID;
              this.chatCollection = this.db.collection('chats', ref => {
                return ref.where('chatID', '==', data.chatID).orderBy('created_at');
              });
              this.chat = this.chatCollection.snapshotChanges().map(actions => {
                return actions.map(a => {
                  const data = a.payload.doc.data() as ConversationData;
                  const id = a.payload.doc.id;
                  return { id,  ...data };
                  });
              });
            } else {
              this.chatAlreadyExist = false;
            }
          }
        } else {
          console.log("nodata")
          this.chatAlreadyExist = false;
        }
      })

    }
  }


  async createNewChat(){

    let data: ConversationData = {
      creator_id:  this.fakeUserUid,
      receiver_id: this.realUserUid,
      created_at:(new Date()),
      content: []
    }
   this.chatCollection5 = this.db.collection<ConversationData>('chats');
   let chatID = await this.chatCollection5.add(data).then(data => chatID =  data.id) ;
    this.db.doc<ConversationData>(`chats/${chatID}`).update({chatID:chatID });
    if(chatID != null) {
    this.insertContentIntoChat(this.message, this.fakeUserUid, chatID);
    }

  }

  async insertContentIntoChat(message: string, creator: string, chatID: string) {
    const data = {
      creator,
      message,
      createdAT: (new Date())
    };
     this.db.doc<ConversationData>(`chats/${chatID}`).update({created_at: (new Date())});
     const ref = this.db.collection('chats').doc(chatID);
     this.chatCollection = this.db.collection('chats', ref => {
       return ref.where('chatID', '==', chatID).orderBy('created_at');
     });
     this.chat = this.chatCollection.snapshotChanges().map(actions => {
       return actions.map(a => {
         const data = a.payload.doc.data() as ConversationData;
         const id = a.payload.doc.id;
         return { id,  ...data };
         });
     });

     this.chatAlreadyExist = true;
     this.chatID = chatID;
     this.message ="";
     return ref.update({
       content: firestore.FieldValue.arrayUnion(data)
     });
  }



  createMessage(){
    this.dbQueries.insertContentIntoChat(this.message, this.fakeUserUid, this.chatID);
    this.message ="";
  }

}
