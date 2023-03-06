import {Component, OnInit} from '@angular/core';
import {Mutation} from '../mutation';
import {MutationService} from '../mutation.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {
  MatchDetailsDialogComponent
} from '../../string-mauling/pattern-mapper/match-details-dialog/match-details-dialog.component';

@Component({
  selector: 'app-mutation-selector',
  templateUrl: './mutation-selector.component.html',
})
export class MutationSelectorComponent implements OnInit {
  newItem: Mutation | null = null;
  dialogRef: MatDialogRef<MatchDetailsDialogComponent> | null = null;
  constructor(
    public service: MutationService,
    public matchDetailsDialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

  select(mutation: Mutation) {
    // navigation terminates the creation of a new user with extreme prejudice
    this.newItem = null;
    this.service.selectItem(mutation);
  }

  create() {
    this.newItem = new Mutation();
  }
  delete(mutation: Mutation) {
    this.service.deleteItem(mutation);
  }

  saveNewItem() {
    if (this.newItem) {
      this.service.addItem(this.newItem);
      this.newItem = null;
    }
  }
  openMatchDetailsDialog(mutation: Mutation): void {
    this.select(mutation);
    this.dialogRef = this.matchDetailsDialog.open(MatchDetailsDialogComponent, {
      width: '350 px',
      height: '90%',
      data: this.service.getMatchesForSelected(),
    });
  }
}
