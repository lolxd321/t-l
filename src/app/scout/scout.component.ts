import { Component, OnInit } from '@angular/core';


export interface Transaction {
  user: string;
  earnedMoney: number;
  status: string;
}

@Component({
  selector: 'app-scout',
  templateUrl: './scout.component.html',
  styleUrls: ['./scout.component.css']
})
export class ScoutComponent {

  displayedColumns = ['user', 'earnedMoney', 'status'];
  transactions: Transaction[] = [
    {user: 'Anna', earnedMoney: 0, status: 'in process'},
    {user: 'Jaquline', earnedMoney: 1, status: 'approved'},
    {user: 'Lisa', earnedMoney: 1, status: 'approved'},
    {user: 'Scarlett', earnedMoney: 1, status: 'approved'},
    {user: 'Anja', earnedMoney: 1, status: 'approved'},
    {user: 'Dora', earnedMoney: 1, status: 'approved'},
  ];

  /** Gets the total cost of all transactions. */
  getTotalCost() {
    return this.transactions.map(t => t.earnedMoney).reduce((acc, value) => acc + value, 0);
  }

}
