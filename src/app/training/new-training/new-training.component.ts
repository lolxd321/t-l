import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TrainingService } from '../training.service';
import { Exercise } from '../exercise.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit, OnDestroy {

  //das wenn direkt hier db zugriff lade
  //exercises: Observable<Exercise[]>;

  //zugriff auf gefetchteten data from training.service.ts

  exercises: Exercise[];
  exerciseSubscription: Subscription;
// connection zur db herstellen
// db jetzt überflüssig da bereits im training.ts
  constructor(private trainingService: TrainingService) {}


  ngOnInit() {

    this.exerciseSubscription = this.trainingService.exercisesChanged.subscribe(
      exercises => (this.exercises = exercises)
    );
    this.trainingService.fetchAvailableExercises();


  // connection zur spezifischen collection
  //value changes zeig nur die values, nicht die ID also header davon wird nicht gezeitgt
    //this.exercises = this.db.collection('availableExercises').valueChanges();

    // this.exercises = this.db
    //   .collection('availableExercises')
    //   .snapshotChanges()
    //   .map(docArray => {
    //     return docArray.map(doc => {
    //       return {
    //         id: doc.payload.doc.id,
    //         name: doc.payload.doc.data()['name'],
    //         duration: doc.payload.doc.data()['duration'],
    //         calories: doc.payload.doc.data()['calories']
    //       };
    //     });
    //   });


    // so später evt. alle länder direkt in DB speichern.. dann über autocomplete o.ä einfügen bei auswahl
    // show values really easy.. ;)
    //this.exercises = this.db.collection('users').valueChanges();

  }

// form von new training , excersise aus select box
onStartTraining(form: NgForm) {
  this.trainingService.startExercise(form.value.exercise);
}


ngOnDestroy() {
  this.exerciseSubscription.unsubscribe();
}

}
