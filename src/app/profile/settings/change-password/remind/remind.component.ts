import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../../../auth/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-remind',
  templateUrl: './remind.component.html',
  styleUrls: ['./remind.component.css']
})
export class RemindComponent implements OnInit {


  email ="";

  blockButton;

  constructor(private afAuth: AngularFireAuth, private snackbar: MatSnackBar) { }

  ngOnInit() {

  }


  resetPassword() {

    this.blockButton = true;



    this.afAuth.auth.sendPasswordResetEmail(this.email).then(
      () => {
        this.snackbar.open("We send you a new email. Check the email for further instructions.", null, {
          duration: 8000
        });

      },
      err => {
        this.snackbar.open("This email does not exist. Please try again.", null, {
          duration: 8000
        });
        this.email="";
        this.blockButton = false;
      }
    );

  }

}
