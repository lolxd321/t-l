import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  mode;
  code;

  password;

  constructor(private router: Router, private activatedActivated: ActivatedRoute,private afAuth: AngularFireAuth) { }

  ngOnInit() {
    // this.mode = this.activatedActivated.snapshot.queryParams['mode'];
    // console.log(this.mode);

    this.code = this.activatedActivated.snapshot.queryParams['oobCode'];




    //this.test();
  }


  updatePassword() {


    const code = this.activatedActivated.snapshot.queryParams['oobCode'];

    console.log(this.password);
    console.log(code);

    this.afAuth.auth
    .confirmPasswordReset(code, this.password)
    .then(() => console.log("pw geändert"))
    .catch(err => {
     const errorMessage = console.log(err.message);
    });
  }

  test() {

    this.afAuth.auth
    .confirmPasswordReset(this.code, "123456789")
    .then(() => console.log("joaaa geht"))
    .catch(err => {
     const errorMessage = console.log(err.message);
    });
  }

}
