import { Component, OnInit } from '@angular/core';
import { trigger,state,style,animate,transition,} from '@angular/animations';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, startWith, map} from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { ToVisit } from '../models/toVisit.model';
import {AppComponent } from '../app.component';
import {FormControl} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CountriesService } from '../dropdown/countries.service';
import { Subscription } from 'rxjs';

export interface UserFollow {
  id?: string;
  user_id: string;
  userToFollow_id: string;
}
@Component({
  selector: 'app-trips',
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.css'],
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

export class TripsComponent implements OnInit {
  myControl = new FormControl();
  myControl2 = new FormControl();
  myControl3 = new FormControl();
  myControl4 = new FormControl();

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
  languageValue: string;
  lookinForValue: string;
  counter  = 0;
  countrySortNameLow:string;
  dateFrom;
  dateTo;
  countryNameStart: string;
  arrayVisitCountryAllData = [];
  array5From = [];
  array6To =[];

  constructor( private db: AngularFirestore, private afAuth: AngularFireAuth, private router: Router, private country:CountriesService) {}

  ngOnInit() {
    this.countryNameStart = "Germany";
    this.countrySortName = "de";
    this.filters();
    this.getCountries();
    this.userToFollow();

    this.getAllUsers();
    this.searchByCountry(this.countryNameStart);

    // this.afAuth.authState.subscribe(user => {
    // if (user) {
    //     this.db.doc<User>(`users/${user.uid}`).update({lastActivity: Date.now() });
    // }
    // });
  }


  getAllUsers(){
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
      }
    }));
  }

  filters() {

    console.log(this.myControl4.valueChanges);

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
            this.countrySortName = currentCountry.sortname;
            this.countrySortNameLow = currentCountry.sortname;
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
    console.log(value);
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



  searchByCountry(value){
    this.dateFrom ="";
    this.dateTo ="";
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
      this.arrayVisitCountryAllData =[];
        for (let data of datas) {
          idArray.push(data.user_id, data.dataArray[1],data.dataArray[2], data.dataArray[3], data.dataArray[4], data.dataArray[5]);
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
              this.isOnline(data.lastActivity),
            ]);
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
              this.isOnline(data.lastActivity),
              idArray[this.getIndexOfCurrentID(data[0]) +1], //country
              idArray[this.getIndexOfCurrentID(data[0]) +2], //state
              idArray[this.getIndexOfCurrentID(data[0]) +3], // city
              idArray[this.getIndexOfCurrentID(data[0]) +4], //from
              idArray[this.getIndexOfCurrentID(data[0]) +5], //to
            ]);

            }
          }
          this.getCurrentQuerie();
        }
      }));
    });
  }



  getCurrentQuerie() {
    let counter = 0;
    if(typeof this.array4Countries != "undefined" && this.array4Countries != null && this.array4Countries.length != null && this.array4Countries.length > 0){
      counter++;
    }else {
      this.array4Countries = [];
    }

    if(typeof this.array5From != "undefined" && this.array5From != null && this.array5From.length != null && this.array5From.length > 0){
      counter++;
    }else {
      this.array5From = [];
    }
    if(typeof this.array6To != "undefined" && this.array6To != null && this.array6To.length != null && this.array6To.length > 0){
      counter++;
    }else {
      this.array6To = [];
    }


    // beim filter... nur mergen.. wenn 1 daf nur
    let mergedArray = this.array4Countries;
    mergedArray = mergedArray.concat(this.array5From);
    mergedArray = mergedArray.concat(this.array6To);

    this.getActualUsers(mergedArray, counter);

    //console.log(this.array4Countries);
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
      }
    }
    this.fbSubs.forEach( sub => sub.unsubscribe());
  }


  from(event) {
    this.array5From =[];
    let dateFrom = event.getTime()/1000;
    for (let data of this.array4Countries){
      if(data[11]!="" && data[11] != null) {
        if(data[11].seconds >= dateFrom){
          this.array5From.push(data);
        }
      }
    }

    console.log(this.array4Countries)
    this.getCurrentQuerie();
  }

  to(event){
    // alles i wie noch zurücksetzen..
    this.array6To =[];
    let dateFrom = event.getTime()/1000;
    for (let data of this.array4Countries){
      if(data[12]!="" && data[12] != null) {
        if(data[12].seconds <= dateFrom){
          this.array6To.push(data);
        }
      }
    }
    this.getCurrentQuerie();
  }

}
