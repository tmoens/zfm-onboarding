import { Component, OnInit } from '@angular/core';
import {User} from '../user';
import {UserService} from '../user.service';

@Component({
  selector: 'app-user-selector',
  templateUrl: './user-selector.component.html',
})
export class UserSelectorComponent implements OnInit {
  newUser: User | null = null;
  constructor(
    public service: UserService,
  ) { }

  ngOnInit(): void {
    if (this.service.list.length > 0) {
      this.service.selectItem(this.service.list[0]);
    }
  }

  select(user: User) {
    // navigation terminates the creation of a new user with extreme prejudice
    this.newUser = null;
    this.service.selectItem(user);
  }

  create() {
    this.newUser = new User();
  }
  delete(user: User) {
    this.service.deleteItem(user);
  }

  saveNewUser() {
    if (this.newUser) {
      this.service.addItem(this.newUser);
      this.newUser = null;
    }
  }
}
