import {Component, Input, OnInit} from '@angular/core';
import {User} from '../user';
import {UserService} from '../user.service';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-user-selector',
  templateUrl: './user-selector.component.html',
})
export class UserSelectorComponent implements OnInit {
  filteredList: User[] = [];
  newItem: User | null = null;
  @Input() filteredListInput: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  constructor(
    public service: UserService,
  ) { }

  ngOnInit(): void {
    this.filteredListInput.subscribe((tgs: User[]) => {
      this.filteredList = tgs
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

  saveNewUser() {
    if (this.newItem) {
      this.service.addItem(this.newItem);
      this.newItem = null;
    }
  }
}
