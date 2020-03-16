import { Component, OnInit , Inject} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { DbQueriesComponent } from '../../../db-queries/db-queries.component';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-start-conversation',
  templateUrl: './start-conversation.component.html',
  styleUrls: ['./start-conversation.component.css']
})


export class StartConversationComponent implements OnInit {

  userDatas =[];
  message: string;


  constructor(

    @Inject(MAT_DIALOG_DATA) public passedData: any,
    private dbQueries: DbQueriesComponent,
    private afAuth: AngularFireAuth
    ) { }

  ngOnInit() {
    this.dbQueries.getAuthUserID();
    this.getAllUserData();
  }

  async getAllUserData() {
    const {url} = await this.dbQueries.getAllUserData(this.passedData.userToSendID);
    const {displayName} = await this.dbQueries.getAllUserData(this.passedData.userToSendID);
    let {birthdate} = await this.dbQueries.getAllUserData(this.passedData.userToSendID);
    let humanReadableBirthdate = this.dbQueries.calculateAge(birthdate);
    this.userDatas.push(url, displayName, humanReadableBirthdate);
  }

   sendMessage() {

    if(this.dbQueries.authUserID == null || this.dbQueries.authUserID == "undefined" || this.dbQueries.authUserID == "")
    {
      return null;
    } else {
      this.dbQueries.insertMessageIntoChats(this.passedData.userToSendID, this.dbQueries.authUserID, this.message);
    }
  }



}
