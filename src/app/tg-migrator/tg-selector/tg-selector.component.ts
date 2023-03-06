import {Component, OnInit} from '@angular/core';
import {Tg} from '../tg';
import {TgService} from '../tg.service';
import {
  MatchDetailsDialogComponent
} from '../../string-mauling/pattern-mapper/match-details-dialog/match-details-dialog.component';
import {MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-tg-selector',
  templateUrl: './tg-selector.component.html',
})
export class TgSelectorComponent implements OnInit {
  newItem: Tg | null = null;
  dialogRef: MatDialogRef<MatchDetailsDialogComponent> | null = null;
  constructor(
    public service: TgService,
    public matchDetailsDialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

  select(tg: Tg) {
    // navigation terminates the creation of a new user with extreme prejudice
    this.newItem = null;
    this.service.selectItem(tg);
  }

  create() {
    this.newItem = new Tg();
  }
  delete(user: Tg) {
    this.service.deleteItem(user);
  }

  saveNewItem() {
    if (this.newItem) {
      this.service.addItem(this.newItem);
      this.newItem = null;
    }
  }
  openMatchDetailsDialog(tg: Tg): void {
    this.select(tg);
    this.dialogRef = this.matchDetailsDialog.open(MatchDetailsDialogComponent, {
      width: '350 px',
      height: '90%',
      data: this.service.getMatchesForSelected(),
    });
  }
}
