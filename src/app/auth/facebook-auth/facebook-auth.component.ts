import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-facebook-auth',
  templateUrl: './facebook-auth.component.html',
  styleUrls: ['./facebook-auth.component.css']
})
export class FacebookAuthComponent implements OnInit {

  maxDate;
    constructor(private authService: AuthService, public dialog: MatDialog) { }

    ngOnInit() {
      this.maxDate = new Date();
      this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
    }

      onSubmit(f: NgForm) {
        this.dialog.closeAll();

        this.authService.FacebookAuth(f.value.gender, f.value.birthdate );
      }

}
