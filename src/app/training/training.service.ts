import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Exercise } from './exercise.model';
import { Subscription } from 'rxjs';


@Injectable()
export class TrainingService {

  exerciseChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();

  // neue subject wird erstellt, das das array exercise beinhjaltet, damit man auf das in anderen components zugreifen kann
  finishedExercisesChanged = new Subject<Exercise[]>();

  private availableExercises: Exercise[] = [];
  private runningExercise: Exercise;
  private fbSubs: Subscription[] = [];


  constructor(private db: AngularFirestore) {}


// fetch from db
fetchAvailableExercises() {
  this.fbSubs.push(this.db
    .collection('availableExercises')
    .snapshotChanges()
    .map(docArray => {
      return docArray.map(doc => {
        return {
          id: doc.payload.doc.id,
          name: doc.payload.doc.data()['name'],
          duration: doc.payload.doc.data()['duration'],
          calories: doc.payload.doc.data()['calories']
        };
      });
    })
    .subscribe((exercises: Exercise[]) => {
      this.availableExercises = exercises;
      this.exercisesChanged.next([...this.availableExercises]);
    }));
}

  startExercise(selectedId: string) {
    // single document update, deleten etc... genauere in docs
    //this.db.doc('availableExercises/' + selectedId).update({lastSelected: new Date()});

    this.runningExercise = this.availableExercises.find(
      ex => ex.id === selectedId
    );
    this.exerciseChanged.next({ ...this.runningExercise });
  }

  completeExercise() {
    this.addDataToDatabase({
      ...this.runningExercise,
      date: new Date(),
      state: 'completed'
    });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  cancelExercise(progress: number) {
    this.addDataToDatabase({
      ...this.runningExercise,
      duration: this.runningExercise.duration * (progress / 100),
      calories: this.runningExercise.calories * (progress / 100),
      date: new Date(),
      state: 'cancelled'
    });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  getRunningExercise() {
    return { ...this.runningExercise };
  }


  // fetch from server wenn neue excersises aufn server vorhanden dann nur emittet
  // wird nur aufgerufen von past-trainings onInit um abzufragen, also wenn past-trainings aufgerufen wird
  fetchCompletedOrCancelledExercises() {
    this.fbSubs.push(this.db
      .collection('finishedExercises')
      .valueChanges()
      .subscribe((exercises: Exercise[]) => {
        this.finishedExercisesChanged.next(exercises);
      }));
  }


// aufgerufen damit kein error erscheint
  cancelSubscriptions() {
  this.fbSubs.forEach(sub => sub.unsubscribe());
  }


  // add array exercise mit allen übungen zur datenbank, wird neu in DB erstellt da noch net exisitiert.
  private addDataToDatabase(exercise: Exercise) {
    this.db.collection('finishedExercises').add(exercise);
  }

}
