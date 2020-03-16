import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  urlCountries :string = "https://raw.githubusercontent.com/hiiamrohit/Countries-States-Cities-database/master/countries.json";
  urlStates :string = "https://raw.githubusercontent.com/lolxd321/travel-ladies/master/states.json";
  urlCities :string = "https://raw.githubusercontent.com/lolxd321/travel-ladies/master/cities.json";

  constructor(private http:HttpClient) { }

  allCountries(): Observable<any>{
    return this.http.get(this.urlCountries);
  }

  allStates(): Observable<any>{
    return this.http.get(this.urlStates);
  }

  allCities(): Observable<any>{
    return this.http.get(this.urlCities);
  }


}
