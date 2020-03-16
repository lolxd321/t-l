import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import {CountriesService } from '../../dropdown/countries.service';
import { Observable, of } from 'rxjs';
import { switchMap, startWith, map} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';

interface User {
  wantsToVisit?: any [];
  test?: string;
}

export interface ToVisit {
  dataArray: any [];
  user_id?: string;
}
export interface ToVisitID extends ToVisit { id: string; }


@Component({
  selector: 'app-add-trip',
  templateUrl: './add-trip.component.html',
  styleUrls: ['./add-trip.component.css']
})
export class AddTripComponent implements OnInit {

  private visitCollection: AngularFirestoreCollection<ToVisit>;
  visits: Observable<ToVisit[]>;
  userVisits: Observable<ToVisit[]>;

  myControl = new FormControl();
  myControl2 = new FormControl();
  myControl3 = new FormControl();
  filteredOptions: Observable<string[]>;
  filteredOptions2: Observable<string[]>;
  filteredOptions3: Observable<string[]>;
  userDoc: AngularFirestoreDocument<User>;
  user: Observable<User>;
  users: Observable<any[]>;
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


  item: string;
  aboutMe: string;


  wantsToVisit: [];
  dateFrom;
  dateTo;


  constructor(private db: AngularFirestore, private afAuth: AngularFireAuth, private country:CountriesService, private _snackBar: MatSnackBar) {
    this.visitCollection = db.collection<ToVisit>('toVisit');
    this.getUserWantToVisits();
 }



 getUserWantToVisits() {
   this.afAuth.authState.subscribe(user => {

     if(user) {

    this.visitCollection = this.db.collection('toVisit', ref => {
      return ref.where('user_id', '==',  user.uid)
    });

    this.userVisits = this.visitCollection.snapshotChanges().map(actions => {
    return actions.map(a => {
    const data = a.payload.doc.data() as ToVisit;
    const id = a.payload.doc.id;
    return { id, ...data };
    });
    });

  } else  {
    return of(null)
  }
    });
 }


  ngOnInit(){
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
    this.getCountries();
    this.users = this.db.collection('users').valueChanges();
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
          if (user) {
            return this.db.doc<User>(`users/${user.uid}`).valueChanges()
          } else {
            return of(null)
          }
      })
    )
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
    console.log(value);
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


  deletePost(value) {
    this.db.doc (`toVisit/${value}`).delete();
  }


  updateContent() {

    this.afAuth.authState.subscribe(user => {

    if (user){

      let arr = [];
      if(this.countrySortName !=null) {
        let countryLowerCase = this.countrySortName.toLowerCase();
        arr.push(countryLowerCase);
      }
      if(this.countryName != null ) {
        arr.push(this.countryName);
      }
      if(this.stateName != null ) {
        arr.push(this.stateName);
      } else {
        let emtpy = "";
        arr.push(emtpy);
      }
      if(this.cityName !=null){
        arr.push(this.cityName);
      } else {
        let emtpy = "";
        arr.push(emtpy);
      }
      if( (this.dateFrom !=null && this.dateTo ==null) || (this.dateFrom ==null && this.dateTo != null) )
      {
        this.openError2();
      }
      if (this.dateFrom !=null && this.dateTo !=null) {
        arr.push(this.dateFrom);
        arr.push(this.dateTo);
      }
      let data: ToVisit = {
        dataArray: arr,
        user_id: user.uid,
      }
      if( this.myControl.value == null || this.myControl.value == '') {
        this.openError1();
      } else {
        this.visitCollection.add(data);
      }
       this.countrySortName= '';
       this.countryName = '';
       this.stateName = '';
       this.cityName  = '';
       this.dateFrom  = null;
       this.dateTo  = null;
       this.myControl.setValue('');
       this.myControl2.setValue('');
       this.myControl3.setValue('');

     }else {
       return of(null)
     }

    });

  }


  openError1() {
    this._snackBar.open("Choose a country.",null,  {
      duration: 5000
    });
  }

  openError2() {
    this._snackBar.open("Select a date.",null,  {
      duration: 5000
    });
  }




}
