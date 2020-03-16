import {SelectionModel} from '@angular/cdk/collections';
import {Component} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: string;
  symbol: string;
  veriefied: string;
}
 


const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'admin', weight: 'pOWlLUCqUDR21w1SRhqoJUnmUsn2', symbol: 'approved', veriefied: 'veriefied'},
  {position: 2, name: 'admin', weight: "iN4BS7wyFmRG5YZX9Jir7HGmPZP2", symbol: 'approved', veriefied: "veriefied"},
  {position: 3, name: 'admin', weight: "hquyCkECmcMr4W85bdzms6tzjaw1", symbol: 'approved', veriefied: "veriefied"},
  {position: 4, name: 'admin', weight: "g3whwl1jtSTows1jVtqRFZBGVkk1", symbol: 'approved', veriefied: "veriefied"},
  {position: 5, name: 'admin', weight: "QlFVHRNmQeXlWmmgzPIK8gp3KtJ3", symbol: 'approved', veriefied: "veriefied"},
  {position: 6, name: 'admin', weight: "Ma27oTCW9CWWAYDNSNyjSi6tV233", symbol: 'approved', veriefied: "veriefied"},
];





@Component({
  selector: 'app-scouts',
  templateUrl: './scouts.component.html',
  styleUrls: ['./scouts.component.css']
})


export class ScoutsComponent  {
    displayedColumns: string[] = ['select', 'position', 'name', 'weight', 'symbol'];



   dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);

   selection = new SelectionModel<PeriodicElement>(true, []);

   /** Whether the number of selected elements matches the total number of rows. */
   isAllSelected() {
     const numSelected = this.selection.selected.length;
     const numRows = this.dataSource.data.length;
     return numSelected === numRows;
   }

   /** Selects all rows if they are not all selected; otherwise clear selection. */
   masterToggle() {
     this.isAllSelected() ?
         this.selection.clear() :
         this.dataSource.data.forEach(row => this.selection.select(row));
   }


   /** The label for the checkbox on the passed row */
   checkboxLabel(row?: PeriodicElement): string {
     if (!row) {
       return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
     }
     return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
   }



   approveUser(){

   }
}
