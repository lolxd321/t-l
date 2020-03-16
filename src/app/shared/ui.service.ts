import { Subject } from 'rxjs';


// kann von überall drauf zugegriffen werden 
export class UIService {
  loadingStateChanged = new Subject<boolean>();
}
