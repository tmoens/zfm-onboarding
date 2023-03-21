import {Injectable} from '@angular/core';
import {User} from './user';
import {GenericService} from '../generics/generic-service';
import {JsonForExcel} from '../generics/json-for-excel';
import {Tg} from '../tg-migrator/tg';

/**
 * Load customer's user information from a spreadsheet. Augment or edit it.
 * Develop map from "researcher" or "pi" information for stocks to these users.
 **/
@Injectable({
  providedIn: 'root'
})
export class UserService extends GenericService<User>{
  serviceName = 'researcher';
  override get worksheetName(): string {
    return 'users';
  }



  override loadJsonItems(usersFromWorksheet: JsonForExcel[]) {
    for (const rawUser of usersFromWorksheet) {
      const user = new User();
      user.datafillFromJson(rawUser);
      // Icky - while loading items we do not use the "add" method because that triggers
      // re-sorting, re-filtering and re-exporting data.
      this._list.push(user);
    }
    this.loadPatchesFromLocalStorage();
  }
  override sortList() {
    this._list.sort((u1: User, u2: User) => {
      if (u1.name.current.toLowerCase() > u2.name.current.toLowerCase()) {
        return 1;
      } else {
        return -1;
      }
    })
    this.list.next(this._list);
  }

  override filterList() {
    if (this._regExpFilter) {
      this._filteredList = this._list.filter((u: User) => {
        return (this._regExpFilter?.test(u.name.current) ||
          this._regExpFilter?.test(u.initials.current) ||
          this._regExpFilter?.test(u.username.current) ||
          this._regExpFilter?.test(u.email.current));
      })
    }
    this.filteredList.next(this._filteredList);
  }

}


