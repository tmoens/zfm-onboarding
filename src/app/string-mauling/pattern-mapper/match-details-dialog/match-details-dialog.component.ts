import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-match-details-dialog',
  templateUrl: './match-details-dialog.component.html',
})
export class MatchDetailsDialogComponent implements OnInit {
  test: string = '';
  matches: {[index:string]: string[]} = {};
  constructor(
    public dialogRef: MatDialogRef<MatchDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) { }


  ngOnInit(): void {
    this.test = JSON.stringify(this.data);
    this.matches = this.data;
  }

}
