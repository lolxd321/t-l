import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {RegisterComponent} from './register/register.component';
import {LogComponent} from './login/log.component';
import {AuthService} from './auth.service';
import { Subscription } from 'rxjs/Subscription';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap} from 'rxjs/operators';
import {BewerbungComponent} from './bewerbung/bewerbung.component';
import {FacebookAuthComponent} from './facebook-auth/facebook-auth.component';


@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})



export class WelcomeComponent implements OnInit {


  isAuth = false;
  authSubscription: Subscription;

  newContent: string;
  secondContent: number;


    constructor(public dialog: MatDialog, private authService: AuthService) {}


    ngOnInit(){
      //  this.dialog.open(BewerbungComponent);

      this.authService.initAuthListener();

       this.authSubscription = this.authService.authChange.subscribe(authStatus => {
         this.isAuth = authStatus;
       });
    }

      openRegister() {
          const dialogRef = this.dialog.open(RegisterComponent);
          dialogRef.afterClosed().subscribe(result => {});
      }

      openRegisterWithFacebook() {
        const dialogRef = this.dialog.open(FacebookAuthComponent);
      }

      openLogin() {
        this.dialog.open(LogComponent);
      }

      getUrl()
      {
        return "url('assets/images/trave.jpg')";
      }




}
