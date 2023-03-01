import {Component, Input, OnInit} from '@angular/core';
import {User} from '../user';
import {UserService} from '../user.service';
import {BehaviorSubject} from 'rxjs';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {
  MatchDetailsDialogComponent
} from '../../string-mauling/pattern-mapper/match-details-dialog/match-details-dialog.component';

@Component({
  selector: 'app-user-selector',
  templateUrl: './user-selector.component.html',
})
export class UserSelectorComponent implements OnInit {
  filteredList: User[] = [];
  newItem: User | null = null;
  dialogRef: MatDialogRef<MatchDetailsDialogComponent> | null = null;
  @Input() filteredListInput: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  constructor(
    public service: UserService,
    public matchDetailsDialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.filteredListInput.subscribe((users: User[]) => {
      this.filteredList = users;
    })
  }

  select(user: User) {
    // navigation terminates the creation of a new user with extreme prejudice
    this.newItem = null;
    this.service.selectItem(user);
  }

  create() {
    this.newItem = new User();
  }
  delete(user: User) {
    this.service.deleteItem(user);
  }

  saveNewItem() {
    if (this.newItem) {
      this.service.addItem(this.newItem);
      this.newItem = null;
    }
  }
}
