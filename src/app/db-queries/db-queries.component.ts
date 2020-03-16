import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { switchMap, startWith, map, first} from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { ConversationData } from '../models/conversationData.model';
import { Router } from '@angular/router';
import { firestore } from 'firebase/app';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-db-queries',
  templateUrl: './db-queries.component.html',
  styleUrls: ['./db-queries.component.css']
})

@Injectable()
export class DbQueriesComponent {

  private user: Observable<User>;
  private chatCollection: AngularFirestoreCollection<ConversationData>;
  private chatCollection2: AngularFirestoreCollection<ConversationData>;
  private chatCollectionReceived: AngularFirestoreCollection<ConversationData>;
  public chats: Observable<ConversationData[]>;
  public chats2: Observable<ConversationData[]>;

  public chatsReceived: Observable<ConversationData[]>;

  public chat: Observable<ConversationData[]>;

  private userCollection: AngularFirestoreCollection<User>;
  public users: Observable<User[]>;
  private fbSubs: Subscription[] = [];


  // chatAlreadyExistID;
  // conversationExist;
  authUserID: string;


  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router ) { }


// get id user logged in
  getAuthUserID() {
    this.afAuth.authState.subscribe(user => {
      if(user) {
         this.authUserID = user.uid;
      } else {
        return of(null);
      }
    });
  }


//USER Collection: get all user Data with with a specific id
  getAllUserData(userID: string) {
    this.user = this.db.doc<User>(`users/${userID}`).valueChanges();
    return this.user.pipe(first()).toPromise();
  }

//self created chats...
  getChats(myID: string) {
    this.chatCollection = this.db.collection('chats', ref => {
      return ref.where('creator_id', '==', myID)
    });
    this.chats = this.chatCollection.valueChanges();
  }

//received..
  getChatsReceived(myID: string) {
    this.chatCollection2 = this.db.collection('chats', ref => {
      return ref.where('receiver_id', '==', myID)
    });
    this.chats2 = this.chatCollection2.valueChanges();
  }

//access to all received chats...
  getReceivedChatCollectionAsObservable(authUser: string) {
  this.chatCollectionReceived = this.db.collection('chats', ref => {
    return ref.where('receiver_id', '==', authUser).orderBy('created_at');
  });
  // nach crated at sortieren..
  this.chatsReceived = this.chatCollectionReceived.snapshotChanges().map(actions => {
    return actions.map(a => {
      const data = a.payload.doc.data() as ConversationData;
      const id = a.payload.doc.id;
      return { id,  ...data };
      });
    });
  }


//access to all self-created chats
  getChatCollectionAsObservable(authUser: string) {
  this.chatCollection = this.db.collection('chats', ref => {
    return ref.where('creator_id', '==', authUser).orderBy('created_at');
  });
  // nach crated at sortieren..
  this.chats = this.chatCollection.snapshotChanges().map(actions => {
    return actions.map(a => {
      const data = a.payload.doc.data() as ConversationData;
      const id = a.payload.doc.id;
      return { id,  ...data };
      });
    });
  }


//get specific chatDocument & save as observable
  // getChatDocument(chatID: string) {
  //   this.chatCollection = this.db.collection('chats', ref => {
  //     return ref.where('chatID', '==', chatID);
  //   });
  //
  //   this.chat = this.chatCollection.snapshotChanges().map(actions => {
  //     return actions.map(a => {
  //       const data = a.payload.doc.data() as ConversationData;
  //       const id = a.payload.doc.id;
  //       return { id, ...data };
  //       });
  //     });
  //
  // }

//save all users in an Observable
  getAllUsers() {
    this.userCollection = this.db.collection('users');
    this.users = this.userCollection.valueChanges();
  }




// calc bday in humanreadable
  calculateAge(bDay){
    let birthDate = bDay.toDate().getTime();
    let timeNow = new Date().getTime();
    let ageDifMs = timeNow - birthDate;
    let ageDate = new Date(ageDifMs);
    return (Math.abs(ageDate.getUTCFullYear() - 1970));
  }



// ------------------ insert ------------------------------------------------------------------------------------------


async createAdminMessage(authID: string) {

    let data: ConversationData = {
      creator_id:"STh55LXVPweLZ9I61nsZT9Y05K93",
      receiver_id: authID,
      created_at:(new Date()),
      content: []
    }
   this.chatCollection = this.db.collection<ConversationData>('chats');
   let chatID = await this.chatCollection.add(data).then(data => chatID =  data.id) ;
    this.db.doc<ConversationData>(`chats/${chatID}`).update({chatID:chatID });

    let message= "Welcome to Travel-Ladies ! 🙂😄👍 I´m Lisa, an administrator of this site. This is an automatic message but I´m a real person. In case you need informations or help don´t hesitate to write me. Please note that you highly increase your chances of success if you upload photos of yourself and write a little about yourself. Thank you for signing up and have a good time !";

    if(chatID != null) {
    this.insertContentIntoChat(message, "STh55LXVPweLZ9I61nsZT9Y05K93", chatID);
    }
}


// new message
  async insertMessageIntoChats(receiverID: string, authID: string, message: string) {
      let data: ConversationData = {
        creator_id: authID,
        receiver_id: receiverID,
        created_at:(new Date()),
        content: []
      }
     this.chatCollection = this.db.collection<ConversationData>('chats');
     let chatID = await this.chatCollection.add(data).then(data => chatID =  data.id) ;
      this.db.doc<ConversationData>(`chats/${chatID}`).update({chatID:chatID });

      if(chatID != null) {
      this.insertContentIntoChat(message, authID, chatID);
      this.router.navigate(['/conversations/sent', chatID]);
      }
  }


// fakeNew message
async fakeMessageNew(receiverID: string, authID: string, message: string) {
    let data: ConversationData = {
      creator_id: authID,
      receiver_id: receiverID,
      created_at:(new Date()),
      content: []
    }
   this.chatCollection = this.db.collection<ConversationData>('chats');
   let chatID = await this.chatCollection.add(data).then(data => chatID =  data.id) ;
    this.db.doc<ConversationData>(`chats/${chatID}`).update({chatID:chatID });

    if(chatID != null) {
    this.insertContentIntoChat(message, authID, chatID);
    this.router.navigate(['/conversations/sent', chatID]);
    }
}



  async insertContentIntoChat(message: string, creator: string, chatID: string) {
    // creating new object in chatContent array
    const data = {
      creator,
      message,
      createdAT: (new Date())
    };
     if (creator && message != null && message != '') {
     this.db.doc<ConversationData>(`chats/${chatID}`).update({created_at: (new Date())});
     const ref = this.db.collection('chats').doc(chatID);
     return ref.update({
       content: firestore.FieldValue.arrayUnion(data)
     });
    }
  }


  ngOnDestroy() {
      this.fbSubs.forEach( sub => sub.unsubscribe());
  }


}
