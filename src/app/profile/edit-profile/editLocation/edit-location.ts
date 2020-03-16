import {Component,OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import {CountriesService } from '../../../dropdown/countries.service';
import { Observable, of } from 'rxjs';
import { switchMap, startWith, map} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import { Subscription } from 'rxjs';
import { Injectable } from '@angular/core';


interface User {
  country?: string;
  state?: string;
  city?: string;
}


@Component({
  selector: 'app-edit-location',
  templateUrl: './edit-location.html',
  styleUrls: ['./edit-location.css']
})

@Injectable()
export class EditLocation implements OnInit  {

  private fbSubs: Subscription[] = [];

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
  firstTime = true;

  currentCountrie: string[];


  constructor(private db: AngularFirestore, private afAuth: AngularFireAuth, private country:CountriesService) { }



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

    //console.log("first countries" + this.currentStates);

    this.users = this.db.collection('users').valueChanges();

    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
        if(user) {
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
    this.countryName = value;
    let arr = [];
    this.country.allCountries().
    subscribe(
      data2 => {
        this.countryInfo=data2.countries;
        for (let currentCountry of this.countryInfo) {
          if(currentCountry.name == value) {
            let countryID = currentCountry.id;
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


  updateContent() {

    this.fbSubs.push(this.afAuth.authState.subscribe(user => {
    if (user) {

      if (this.countryName != null) {
         console.log("hmmm" + this.countryName);
          this.db.doc<User>(`users/${user.uid}`).update({country:this.countryName.replace(/[0-9]/g, '') });
          this.countryName = null;
      }
      if (this.stateName != null) {
          this.db.doc<User>(`users/${user.uid}`).update({state:this.stateName.replace(/[0-9]/g, '') });
          this.stateName = null;
      }

      if (this.cityName != null) {
          this.db.doc<User>(`users/${user.uid}`).update({city:this.cityName });
          this.cityName = null;
      }
    } else {
      return of(null)
    }
    }));
  }

  cancelSubscriptions() {
    this.fbSubs.forEach( sub => sub.unsubscribe());
  }

}
