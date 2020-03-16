import {Component, OnInit} from '@angular/core';
import { NgForm } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import { AuthService } from '../auth.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  maxDate;

  constructor(private authService: AuthService, public dialog: MatDialog) { }

  ngOnInit() {
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }

  public resolved(captchaResponse: string) {
   console.log(`Resolved captcha with response: ${captchaResponse}`);
 }
// hier gehen daten hin ..
  onSubmit(f: NgForm) {
    this.dialog.closeAll();

    this.authService.registerUser( {email: f.value.email, password: f.value.password}, f.value.gender, f.value.name, f.value.birthdate );
  }
}
