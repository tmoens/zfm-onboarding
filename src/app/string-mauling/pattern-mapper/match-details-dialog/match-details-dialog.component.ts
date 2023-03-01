import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-match-details-dialog',
  templateUrl: './match-details-dialog.component.html',
})
export class MatchDetailsDialogComponent implements OnInit {
  matches: {[index:string]: string[]} = {};
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
    ) { }


  ngOnInit(): void {
    this.matches = this.data;
  }
}
