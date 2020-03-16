import {Component, OnInit, OnDestroy} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {AuthService} from '../auth.service';
import { UIService } from '../../shared/ui.service';
import {Subscription} from 'rxjs';
import { AppComponent } from '../.././app.component';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit, OnDestroy {


  loginForm: FormGroup;
  isLoading = false;
  private loadingSubs: Subscription;

  constructor(private afAuth: AngularFireAuth, private authService: AuthService, public dialog: MatDialog, private uiService: UIService, private appCompo: AppComponent) { }

  ngOnInit() {
    this.loadingSubs = this.uiService.loadingStateChanged.subscribe(isLoading => {
      this.isLoading = isLoading;
    });

    this.loginForm = new FormGroup({
      email: new FormControl('', {
        validators: [Validators.required, Validators.email]
      }),
      password: new FormControl('', { validators: [Validators.required] })
    });

  }


  onSubmit() {
    this.dialog.closeAll();

    this.authService.login({
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    });
    this.appCompo.onLogin();
  }

  async FacebookAuthLogin(){
    this.dialog.closeAll();
    this.authService.FacebookAuthLogin();



  }

  ngOnDestroy() {
    this.loadingSubs.unsubscribe();
  }

}
