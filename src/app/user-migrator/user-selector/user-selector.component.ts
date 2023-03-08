import {Component, Input, OnInit} from '@angular/core';
import {User} from '../user';
import {ResearcherService} from '../researcher.service';

@Component({
  selector: 'app-user-selector',
  templateUrl: './user-selector.component.html',
})
export class UserSelectorComponent implements OnInit {
  filteredUsers: User[] = [];
  @Input() primaryInvestigatorsOnly: boolean = false;
  newItem: User | null = null;
  constructor(
    public service: ResearcherService,
  ) { }

  ngOnInit(): void {
    this.service.filteredList.subscribe((users: User[]) => {
      if (this.primaryInvestigatorsOnly) {
        this.filteredUsers = users.filter((user: User) => {
          return (user.isPrimaryInvestigator.current === 'yes');
        })
      } else this.filteredUsers = users;
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
