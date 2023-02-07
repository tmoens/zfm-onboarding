import { Component, OnInit } from '@angular/core';
import {AppStateService} from '../../app-state.service';
import {UserService} from '../user.service';
import {User, UserRole} from '../user';

@Component({
  selector: 'app-user-selector',
  templateUrl: './user-selector.component.html',
})
export class UserSelectorComponent implements OnInit {

  constructor(
    public appState: AppStateService,
    public service: UserService,
  ) { }

  ngOnInit(): void {
    if (this.service.list.length > 0) {
      this.service.select(this.service.list[0]);
    }
  }

  selectUser(user: User) {
    this.service.select(user);
  }

  addUser() {
    this.service.createUser();
  }

  deleteUser(user: User) {
    this.service.delete(user);
  }
}
