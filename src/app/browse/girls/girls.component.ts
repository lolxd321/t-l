import { Component, OnInit , OnChanges, SimpleChanges, ViewChild} from '@angular/core';
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
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to';

export interface UserFollow {
  id?: string;
  user_id: string;
  userToFollow_id: string;
}

export interface PeriodicElement {
  position: number;
}



@Component({
  selector: 'app-girls',
  templateUrl: './girls.component.html',
  styleUrls: ['./girls.component.css'],
  animations: [
      trigger('slideInOut', [
        state('in', style({opacity: 1})),
        transition(':enter', [
          style({opacity: 0}),
          animate(600 )
        ]),
        transition(':leave',
          animate(600, style({opacity: 0})))
      ])
    ]
})
export class GirlsComponent implements OnInit {
  myControl = new FormControl();
  myControl2 = new FormControl();
  myControl3 = new FormControl();
  filteredOptions: Observable<string[]>;
  filteredOptions2: Observable<string[]>;
  filteredOptions3: Observable<string[]>;
  countryName: string;
  stateName: string;
  cityName: string;
  stateInfo: any[] = [];
  countryInfo: any[] = [];
  cityInfo: any[] = [];
  currentCountries: string[];
  currentStates: string[];
  currentCities: string[];
  currentCountrie: string[];
  countrySortName: string;
  private userCollection: AngularFirestoreCollection<User>;
  private fbSubs: Subscription[] = [];
  userData: Observable<User[]>;
  userFollows: Observable<UserFollow[]>;
  toVisits: Observable<ToVisit[]>;
  private userFollowCollection: AngularFirestoreCollection<UserFollow>;
  private toVisitCollection: AngularFirestoreCollection<ToVisit>;
  bDay;
  spinner = true;
  myId = "";
  userIamFollowingID=[];
  userIamFollowingAll=[];
  allIdsArray = [];
  searchGirls: boolean;
  girlTrue: boolean;
  manTrue: boolean;
  gender: string;
  private users: Observable<User[]>;
  array1All = [];
  array2Languages =[];
  array3LookingFor = [];
  array4Countries = [];
  arrayCurrentQuerie = [];
  outputCurrentQuery =[];
  array5States =[];
  array6Cities =[];
  array7Eyes =[];
  array8hairValue =[];
  array9bodyTypeValue = [];
  array10NameValue = [];
  languageValue: string;
  lookinForValue: string;
  hairValue: string;
  bodyTypeValue: string;
  filterTrue = false;


  nameInput: string;
  eyesValues: string;
  counter  = 0;


  displayedColumns: string[] = ['position'];
  dataSource;



  constructor(private _scrollToService: ScrollToService, private appCompo: AppComponent, private db: AngularFirestore, private afAuth: AngularFireAuth, private router: Router, private country:CountriesService) {}

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit() {

    this.spinner = false;
    this.filters();
    this.getCountries();
    this.userToFollow();

    this.appCompo.getMyProfileVisitors();
    if(this.router.url == "/browse/man") {
      this.gender="men"
      this.girlTrue = false;
      this.manTrue = true;
      this.getAllMan();

    } else if(this.router.url == "/browse/girls") {
      this.gender="girls"
      this.girlTrue = true;
      this.manTrue = false;
      this.getAllGirls();

    }
  }



  getAllGirls() {
    this.array1All = [];
    this.userCollection = this.db.collection('users', ref => {
        return ref.where('gender', '==', 'Female')
    });
    this.users = this.userCollection.valueChanges();


    this.fbSubs.push(this.users.subscribe( datas => {
      if(datas){
        for (let data of datas) {
            this.array1All.push([
            data.uid,
            data.displayName,
            this.calculateAge(data.birthdate),
            data.url,
            data.languages,
            data.lookingFor,
            data.country,
            this.isOnline(data.lastActivity)
          ]);
        }
      this.dataSource = new MatTableDataSource<PeriodicElement>(this.array1All);
      this.dataSource.paginator = this.paginator;
      }



    }));
  }


  isOnline(time){
    let timeSeconds = time / 1000;
    let currentTime = Date.now() /1000;
    let difference = currentTime - timeSeconds;
    if(difference <= 200) {
      return true;
    }else {
      return false;
    }
  }

  getAllMan() {
    this.array1All = [];
    this.userCollection = this.db.collection('users', ref => {
        return ref.where('gender', '==', 'Male')
    });
    this.users = this.userCollection.valueChanges();
    this.fbSubs.push(this.users.subscribe( datas => {
      if(datas){
        for (let data of datas) {
            this.array1All.push([
            data.uid,
            data.displayName,
            this.calculateAge(data.birthdate),
            data.url,
            data.languages,
            data.lookingFor,
            data.country,
            this.isOnline(data.lastActivity)
          ]);
        }
        this.dataSource = new MatTableDataSource<PeriodicElement>(this.array1All);
        this.dataSource.paginator = this.paginator;
      }
    }));
  }

  getCurrentQuerie() {
    let counter = 0;
    if(typeof this.array2Languages != "undefined" && this.array2Languages != null && this.array2Languages.length != null && this.array2Languages.length > 0) {
      counter++;
    }else {
      if(this.languageValue != null) {
        counter++;
      }
      this.array2Languages = [];
    }
    if(typeof this.array3LookingFor != "undefined" && this.array3LookingFor != null && this.array3LookingFor.length != null && this.array3LookingFor.length > 0){
      counter++;
    }else {
      if(this.lookinForValue!=null) {
        counter++;
      }
      this.array3LookingFor = [];
    }

    if(typeof this.array4Countries != "undefined" && this.array4Countries != null && this.array4Countries.length != null && this.array4Countries.length > 0){
      counter++;
    }else {
      this.array4Countries = [];
    }
    if(typeof this.array5States != "undefined" && this.array5States != null && this.array5States.length != null && this.array5States.length > 0){
      counter++;
    }else {
      this.array5States = [];
    }
    if(typeof this.array6Cities != "undefined" && this.array6Cities != null && this.array6Cities.length != null && this.array6Cities.length > 0){
      counter++;
    }else {
      this.array6Cities = [];
    }
    if(typeof this.array7Eyes != "undefined" && this.array7Eyes != null && this.array7Eyes.length != null && this.array7Eyes.length > 0){
      counter++;
    }else {
      this.array7Eyes = [];
    }
    if(typeof this.array8hairValue != "undefined" && this.array8hairValue != null && this.array8hairValue.length != null && this.array8hairValue.length > 0){
      counter++;
    }else {
      this.array8hairValue = [];
    }
    if(typeof this.array9bodyTypeValue != "undefined" && this.array9bodyTypeValue != null && this.array9bodyTypeValue.length != null && this.array9bodyTypeValue.length > 0){
      counter++;
    }else {
      this.array9bodyTypeValue = [];
    }
    if(typeof this.array10NameValue != "undefined" && this.array10NameValue != null && this.array10NameValue.length != null && this.array10NameValue.length > 0){
      counter++;
    }else {
      this.array10NameValue = [];
    }




    let mergedArray = this.array2Languages.concat(this.array3LookingFor);
    mergedArray = this.array4Countries.concat(mergedArray);
    mergedArray = this.array5States.concat(mergedArray);
    mergedArray = this.array6Cities.concat(mergedArray);
    mergedArray = this.array7Eyes.concat(mergedArray);
    mergedArray = this.array8hairValue.concat(mergedArray);
    mergedArray = this.array9bodyTypeValue.concat(mergedArray);
    mergedArray = this.array10NameValue.concat(mergedArray);

    this.getActualUsers(mergedArray, counter);
  }
  getActualUsers(mergedArray, counter){
    let array =[];
    for(let data of mergedArray) {
      array.push(data[0]);
    }
    let array2 =[];
    let outPutArray =[];
    for(let data of mergedArray) {
      if(this.getOccurrence(array, data[0]) == counter) {
        array2.push(data[0]);
        outPutArray.push(data);
      }
    }
    let test =[];
    this.array1All =[];
    for (let i = 0; i < outPutArray.length; i++) {
      if(test.includes(outPutArray[i][0])) {
        //nix soll gemacht werden..
      } else {
        test.push(outPutArray[i][0]);
        this.array1All.push(outPutArray[i]);
              this.dataSource = new MatTableDataSource<PeriodicElement>(this.array1All);
      }
    }

    this.fbSubs.forEach( sub => sub.unsubscribe());
  }
  changeLanguage(languageValue) {

    this.languageValue = languageValue.target.value;
    this.array2Languages =[];

    if(this.languageValue == "all"){
      this.users = this.userCollection.valueChanges();
      this.fbSubs.push(this.users.subscribe( datas => {
        if(datas){
          for (let data of datas) {
              this.array2Languages.push([
              data.uid,
              data.displayName,
              this.calculateAge(data.birthdate),
              data.url,
              data.languages,
              data.lookingFor,
              data.country,
              this.isOnline(data.lastActivity)]);
          }
          this.getCurrentQuerie();
        }
      }));
    }else {
      this.users = this.userCollection.valueChanges();
      this.fbSubs.push(this.users.subscribe( datas => {
        if(datas){
          this.array1All = [];
          for (let data of datas) {
              this.array1All.push([
              data.uid,
              data.displayName,
              this.calculateAge(data.birthdate),
              data.url,
              data.languages,
              data.lookingFor,
              data.country,
              this.isOnline(data.lastActivity)]);
          }
          for (let data of this.array1All) {
            if(typeof data[4] != "undefined" && data[4] != null && data[4].length != null && data[4].length > 0){
              if(data[4].includes(languageValue.target.value)) {
                this.array2Languages.push([
                data[0],
                data[1],
                data[2],
                data[3],
                data[4],
                data[5],
                data[6],
                this.isOnline(data.lastActivity)]);
              }
            }
          }
          this.getCurrentQuerie();
        }
      }));
    }

  }


  changeEyes(eyesValue) {
    this.eyesValues = eyesValue.target.value;
    this.array7Eyes = [];

    if(this.eyesValues == "all"){
      this.users = this.userCollection.valueChanges();
      this.fbSubs.push(this.users.subscribe( datas => {
        if(datas){
          for (let data of datas) {
              this.array3LookingFor.push([
              data.uid,
              data.displayName,
              this.calculateAge(data.birthdate),
              data.url,
              data.languages,
              data.lookingFor,
              data.country,
              this.isOnline(data.lastActivity)]);
          }
          this.getCurrentQuerie();
        }
      }));
    }else {
      this.users = this.userCollection.valueChanges();
      this.fbSubs.push(this.users.subscribe( datas => {
        if(datas){
          this.array1All = [];
          for (let data of datas) {
              this.array1All.push([
              data.uid,
              data.displayName,
              this.calculateAge(data.birthdate),
              data.url,
              data.languages,
              data.lookingFor,
              data.country, this.isOnline(data.lastActivity),
              data.eyes],
              );
          }
          for (let data of this.array1All) {
            if(typeof data != "undefined" && data != null && data.length != null && data.length > 0){
              if(data.includes(this.eyesValues)) {
                this.array7Eyes.push([
                data[0],
                data[1],
                data[2],
                data[3],
                data[4],
                data[5],
                data[6],
                this.isOnline(data.lastActivity)]);
              }
            }
          }
          this.getCurrentQuerie();
        }
      }));
    }
  }
  changeHair(hairValue) {
    this.hairValue = hairValue.target.value;
    this.array8hairValue = [];


    if(this.hairValue == "all"){
      this.users = this.userCollection.valueChanges();
      this.fbSubs.push(this.users.subscribe( datas => {
        if(datas){
          for (let data of datas) {
              this.array8hairValue.push([
              data.uid,
              data.displayName,
              this.calculateAge(data.birthdate),
              data.url,
              data.languages,
              data.lookingFor,
              data.country,
              this.isOnline(data.lastActivity)]);
          }
          this.getCurrentQuerie();
        }
      }));
    }else {
      this.users = this.userCollection.valueChanges();
      this.fbSubs.push(this.users.subscribe( datas => {
        if(datas){
          this.array1All = [];
          for (let data of datas) {
              this.array1All.push([
              data.uid,
              data.displayName,
              this.calculateAge(data.birthdate),
              data.url,
              data.languages,
              data.lookingFor,
              data.country,
              this.isOnline(data.lastActivity),
              data.hair
            ]);
          }
          for (let data of this.array1All) {
            if(typeof data != "undefined" && data != null && data.length != null && data.length > 0){
              if(data.includes(this.hairValue)) {
                this.array8hairValue.push([
                data[0],
                data[1],
                data[2],
                data[3],
                data[4],
                data[5],
                data[6],
                this.isOnline(data.lastActivity)]);
              }
            }
          }
          this.getCurrentQuerie();
        }
      }));
    }

  }

  onChangeName(event){
    this.nameInput = event;
    this.array10NameValue = [];

    console.log(this.nameInput)

    if(this.nameInput == ""){
      this.users = this.userCollection.valueChanges();
      this.fbSubs.push(this.users.subscribe( datas => {
        if(datas){
          for (let data of datas) {
              this.array10NameValue.push([
              data.uid,
              data.displayName,
              this.calculateAge(data.birthdate),
              data.url,
              data.languages,
              data.lookingFor,
              data.country,
              this.isOnline(data.lastActivity)]);
          }
          this.getCurrentQuerie();
        }
      }));
    }else {
      this.users = this.userCollection.valueChanges();
      this.fbSubs.push(this.users.subscribe( datas => {
        if(datas){
          this.array1All = [];
          for (let data of datas) {
              this.array1All.push([
              data.uid,
              data.displayName,
              this.calculateAge(data.birthdate),
              data.url,
              data.languages,
              data.lookingFor,
              data.country,
              this.isOnline(data.lastActivity),
              data.bodyType]);
          }
          for (let data of this.array1All) {
            if(typeof data != "undefined" && data != null && data.length != null && data.length > 0){
              if(data.includes(this.nameInput)) {
                this.array10NameValue.push([
                data[0],
                data[1],
                data[2],
                data[3],
                data[4],
                data[5],
                data[6],
                this.isOnline(data.lastActivity)]);
              }
            }
          }
          this.getCurrentQuerie();
        }
      }));
    }


  }


  changeBodyType(bodyTypeValue) {
    this.bodyTypeValue = bodyTypeValue.target.value;
    this.array9bodyTypeValue = [];

    if(this.bodyTypeValue == "all"){
      this.users = this.userCollection.valueChanges();
      this.fbSubs.push(this.users.subscribe( datas => {
        if(datas){
          for (let data of datas) {
              this.array9bodyTypeValue.push([
              data.uid,
              data.displayName,
              this.calculateAge(data.birthdate),
              data.url,
              data.languages,
              data.lookingFor,
              data.country,
              this.isOnline(data.lastActivity)]);
          }
          this.getCurrentQuerie();
        }
      }));
    }else {
      this.users = this.userCollection.valueChanges();
      this.fbSubs.push(this.users.subscribe( datas => {
        if(datas){
          this.array1All = [];
          for (let data of datas) {
              this.array1All.push([
              data.uid,
              data.displayName,
              this.calculateAge(data.birthdate),
              data.url,
              data.languages,
              data.lookingFor,
              data.country,
              this.isOnline(data.lastActivity),
              data.bodyType]);
          }
          for (let data of this.array1All) {
            if(typeof data != "undefined" && data != null && data.length != null && data.length > 0){
              if(data.includes(this.bodyTypeValue)) {
                this.array9bodyTypeValue.push([
                data[0],
                data[1],
                data[2],
                data[3],
                data[4],
                data[5],
                data[6],
                this.isOnline(data.lastActivity)]);
              }
            }
          }
          this.getCurrentQuerie();
        }
      }));
    }
  }


  changelookingFor(lookinForValue) {
    this.lookinForValue = lookinForValue.target.value;
    this.array3LookingFor = [];
    if(this.lookinForValue == "all"){
      this.users = this.userCollection.valueChanges();
      this.fbSubs.push(this.users.subscribe( datas => {
        if(datas){
          for (let data of datas) {
              this.array3LookingFor.push([
              data.uid,
              data.displayName,
              this.calculateAge(data.birthdate),
              data.url,
              data.languages,
              data.lookingFor,
              data.country,
              this.isOnline(data.lastActivity)]);
          }
          this.getCurrentQuerie();
        }
      }));
    }else {
      this.users = this.userCollection.valueChanges();
      this.fbSubs.push(this.users.subscribe( datas => {
        if(datas){
          this.array1All = [];
          for (let data of datas) {
              this.array1All.push([
              data.uid,
              data.displayName,
              this.calculateAge(data.birthdate),
              data.url,
              data.languages,
              data.lookingFor,
              data.country, this.isOnline(data.lastActivity)]);
          }
          for (let data of this.array1All) {
            if(typeof data[5] != "undefined" && data[5] != null && data[5].length != null && data[5].length > 0){
              if(data[5].includes(lookinForValue.target.value)) {
                this.array3LookingFor.push([
                data[0],
                data[1],
                data[2],
                data[3],
                data[4],
                data[5],
                data[6],
                 this.isOnline(data.lastActivity)]);
              }
            }
          }
          this.getCurrentQuerie();
        }
      }));
    }
  }

  searchByCountry(value){
    this.array1All = [];
    this.allIdsArray = [];
    this.array4Countries =[];
    this.toVisitCollection = this.db.collection('toVisit', ref => {
      return ref.where('dataArray', 'array-contains', value)
    });
    this.toVisits = this.toVisitCollection.snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as ToVisit;
        const id = a.payload.doc.id;
        return { id, ...data };
        });
    });
    this.toVisits.subscribe(datas => {
      let idArray=[];
        for (let data of datas) {
          idArray.push(data.user_id, data.dataArray[1],data.dataArray[2], data.dataArray[3]);
        }
      this.allIdsArray = idArray;
      this.users = this.userCollection.valueChanges();
      this.fbSubs.push(this.users.subscribe( datas => {
        if(datas){
          this.array1All = [];
          for (let data of datas) {
              this.array1All.push([
              data.uid,
              data.displayName,
              this.calculateAge(data.birthdate),
              data.url,
              data.languages,
              data.lookingFor,
              data.country, this.isOnline(data.lastActivity)]);
          }
          for (let data of this.array1All) {
            if(idArray.includes(data[0])){
              this.array4Countries.push([
              data[0],
              data[1],
              data[2],
              data[3],
              data[4],
              data[5],
              data[6],
              this.isOnline(data.lastActivity)
            ]);

            }
          }
          this.getCurrentQuerie();
        }
      }));
    });
  }
  searchByState(value){
    this.array1All = [];
    this.array5States =[];
    this.toVisitCollection = this.db.collection('toVisit', ref => {
      return ref.where('dataArray', 'array-contains', value)
    });
    this.toVisits = this.toVisitCollection.snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as ToVisit;
        const id = a.payload.doc.id;
        return { id, ...data };
        });
    });
    this.toVisits.subscribe(datas => {
      let idArray=[];
        for (let data of datas) {
          idArray.push(data.user_id);
        }
      this.allIdsArray = idArray;
      this.users = this.userCollection.valueChanges();
      this.fbSubs.push(this.users.subscribe( datas => {
        if(datas){
          this.array1All = [];
          for (let data of datas) {
              this.array1All.push([
              data.uid,
              data.displayName,
              this.calculateAge(data.birthdate),
              data.url,
              data.languages,
              data.lookingFor,
              data.country, this.isOnline(data.lastActivity)]);
          }
          for (let data of this.array1All) {
            if(idArray.includes(data[0])){
              this.array5States.push([
              data[0],
              data[1],
              data[2],
              data[3],
              data[4],
              data[5],
              data[6],
              this.isOnline(data.lastActivity)
            ]);
            }
          }
          this.getCurrentQuerie();
        }
      }));
    });
  }
  searchByCity(value){
    this.array1All = [];
    this.array6Cities =[];
    this.toVisitCollection = this.db.collection('toVisit', ref => {
      return ref.where('dataArray', 'array-contains', value)
    });
    this.toVisits = this.toVisitCollection.snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as ToVisit;
        const id = a.payload.doc.id;
        return { id, ...data };
        });
    });
    this.toVisits.subscribe(datas => {
      let idArray=[];
        for (let data of datas) {
          idArray.push(data.user_id);
        }
      this.allIdsArray = idArray;
      this.users = this.userCollection.valueChanges();
      this.fbSubs.push(this.users.subscribe( datas => {
        if(datas){
          this.array1All = [];
          for (let data of datas) {
              this.array1All.push([
              data.uid,
              data.displayName,
              this.calculateAge(data.birthdate),
              data.url,
              data.languages,
              data.lookingFor,
              data.country,
            this.isOnline(data.lastActivity)]);
          }
          for (let data of this.array1All) {
            if(idArray.includes(data[0])){
              this.array6Cities.push([
              data[0],
              data[1],
              data[2],
              data[3],
              data[4],
              data[5],
              data[6],
            ]);
            }
          }
          this.getCurrentQuerie();
        }
      }));
    });
  }
  searchAllManByCountry(value) {
    this.afAuth.authState.subscribe(user => {
     this.userCollection = this.db.collection('users', ref => {
       return ref.where('gender', '==', 'Male').where('toVisit', '==', value );
     });
     // return eine komplette usercollection...

    this.userData = this.userCollection.snapshotChanges().map(actions => {
    return actions.map(a => {
    const data = a.payload.doc.data() as User;
    const bDay = this.calculateAge(data.birthdate);
    const id = a.payload.doc.id;
    return { id, bDay, ...data };
    });
    });
    this.spinner = false;
    });
  }




  calculateAge(bDay){
    let birthDate = bDay.toDate().getTime();
    let timeNow = new Date().getTime();
    let ageDifMs = timeNow - birthDate;
    let ageDate = new Date(ageDifMs);
    return (Math.abs(ageDate.getUTCFullYear() - 1970));
  }
  getOccurrence(array, value) {
     return array.filter((v) => (v === value)).length;
   }
  userIDinArray(userID: string) {
     if (this.userIamFollowingID.includes(userID))
     {
       return true;
     } else {
       return false;
     }
   }
  goToUser(id: string, name: string){
    this.router.navigate(['/profile/', id , name]);
  }
  followUser(id:string){

    let data: UserFollow = {
      user_id: this.myId,
      userToFollow_id: id,
    }
    this.userFollowCollection = this.db.collection<UserFollow>('userToFollow');
    this.userFollowCollection.add(data);
  }
  removeUser(userID:string) {

    for (let userFollowInfos of this.userIamFollowingAll) {
      if(userFollowInfos.userToFollow_id == userID) {
        this.db.doc (`userToFollow/${userFollowInfos.id}`).delete();
      }
    }
    this.userIamFollowingID =[];
  }
  getIndexOfCurrentID(id) {
    for (let i =0; i < this.allIdsArray.length; i++ ) {
      if(id == this.allIdsArray[i]) {
        return i;
      }
    }
  }

  filters() {
    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
      this.filteredOptions2 = this.myControl2.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter2(value))
        );
      this.filteredOptions3 = this.myControl3.valueChanges
          .pipe(
            startWith(''),
            map(value => this._filter3(value))
        );
  }
  private _filter(value: string): string[] {
    if (this.myControl2.value != null) {
      this.myControl2.setValue('');
      this.myControl3.setValue('');
      this.stateName = '';
      this.cityName  = '';
      this.currentStates = [];
    }
    if (this.currentCountries != null)
    {
      const filterValue = value.toLowerCase();
      return this.currentCountries.filter(option => option.toLowerCase().includes(filterValue));
    }
  }
  private _filter2(value: string): string[] {
    if (this.myControl3.value != null) {
      this.myControl3.setValue('');
      this.cityName  = '';
      this.currentCities = [];
    }

    if (this.currentStates != null)
    {
      const filterValue = value.toLowerCase();
      return this.currentStates.filter(option => option.toLowerCase().includes(filterValue));
    }
  }
  private _filter3(value: string): string[] {
    if (this.currentCities != null)
    {
      const filterValue = value.toLowerCase();
      return this.currentCities.filter(option => option.toLowerCase().includes(filterValue));
    }
  }
  onChangeCountry2(value){
    this.searchByCountry(value);
    this.countryName = value;
    let arr = [];
    this.country.allCountries().
    subscribe(
      data2 => {
        this.countryInfo=data2.countries;
        for (let currentCountry of this.countryInfo) {
          if(currentCountry.name == value) {
            let countryID = currentCountry.id;
            //console.log(currentCountry);
            this.countrySortName = currentCountry.sortname;
            this.country.allStates().
            subscribe(
              data2 => {
                this.stateInfo=data2.states;
                for (let currentStates of this.stateInfo) {
                  if(currentStates.country_id == countryID)
                  {
                    arr.push(currentStates.name);
                  }
                }
              },
              err => console.log(err),
              () => console.log('complete')
            )
          }
        }
      },
      err => console.log(err),
      () => console.log('complete')
    )
    this.currentStates = arr;
  }
  onChangeState2(value){
    this.searchByState(value);
    this.stateName = value;
    let arr = [];
    this.country.allStates().
    subscribe(
      data2 => {
        this.stateInfo=data2.states;

        for (let currentState of this.stateInfo) {

          if(currentState.name == value) {
            let cityID = currentState.id;
            this.country.allCities().
            subscribe(
              data2 => {
                this.cityInfo=data2.cities;
                for (let currentCity of this.cityInfo) {
                  if(currentCity.state_id == cityID)
                  {
                    arr.push(currentCity.name);
                  }
                }
              },
              err => console.log(err),
              () => console.log('complete')
            )
          }
        }
      },
      err => console.log(err),
      () => console.log('complete')
    )
    this.currentCities = arr;
  }
  onChangeCity3(value) {
    this.cityName = value;
    this.searchByCity(value);
  }
  getCountries(){
    let arr = [];
    this.country.allCountries().
    subscribe(
      data2 => {
        this.countryInfo=data2.countries;
        for (let countries of this.countryInfo) {
            arr.push(countries.name);
        }
      },
      err => console.log(err),
      () => console.log('complete')
    )
    this.currentCountries = arr;
  }
  userToFollow(){
    this.fbSubs.push(this.afAuth.authState.subscribe(user => {
      if(user) {
        this.myId = user.uid;
        this.userFollowCollection = this.db.collection('userToFollow', ref => {
          return ref.where('user_id', '==', user.uid)
        });
        this.userFollows = this.userFollowCollection.snapshotChanges().map(actions => {
        return actions.map(a => {
        const data = a.payload.doc.data() as UserFollow;
        const id = a.payload.doc.id;
        return { id, ...data };
        });
        });

        this.userFollows.subscribe(userFollows => {
            for (let userFollow of userFollows) {
              this.userIamFollowingID.push(userFollow.userToFollow_id);
              this.userIamFollowingAll.push(userFollow);
            }
        });

      } else {
        return of(null)
      }
    }));
  }
  handleChange(event){
    if(event.value == "girl") {
      this.router.navigate(['/browse/girls']);
      // check if .. urll. then..
    }else if(event.value == "man") {
      this.router.navigate(['/browse/man']);
    }
  }

  toToTop() {

    console.log("asdsasd");
    const config: ScrollToConfigOptions = {target: 'destination'};
    this._scrollToService.scrollTo(config);
  }

  dropDownFilter() {
    this.filterTrue = !this.filterTrue;
  }
}
