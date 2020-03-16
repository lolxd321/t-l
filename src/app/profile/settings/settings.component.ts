import { Component, OnInit } from '@angular/core';
import { trigger,state,style,animate,transition,} from '@angular/animations';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {HideAccountComponent} from './hide-account/hide-account.component';
import {DeleteAccountComponent} from './delete-account/delete-account.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  animations: [
      // the fade-in/fade-out animation.
      trigger('slideInOut', [

        // the "in" style determines the "resting" state of the element when it is visible.
        state('in', style({opacity: 1})),

        // fade in when created. this could also be written as transition('void => *')
        transition(':enter', [
          style({opacity: 0}),
          animate(600 )
        ]),

        // fade out when destroyed. this could also be written as transition('void => *')
        transition(':leave',
          animate(600, style({opacity: 0})))
      ])
    ]
})
export class SettingsComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }


  openHideAccount() {
    this.dialog.open(HideAccountComponent);
  }

  openDeleteAccount() {
    this.dialog.open(DeleteAccountComponent);
  }
}
