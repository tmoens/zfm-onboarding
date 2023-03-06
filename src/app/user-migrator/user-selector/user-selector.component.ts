import {Component, OnInit} from '@angular/core';
import {User} from '../user';
import {UserService} from '../user.service';

@Component({
  selector: 'app-user-selector',
  templateUrl: './user-selector.component.html',
})
export class UserSelectorComponent implements OnInit {
  newItem: User | null = null;
  constructor(
    public service: UserService,
  ) { }

  ngOnInit(): void {
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
