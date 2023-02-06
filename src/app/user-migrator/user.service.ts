import { Injectable } from '@angular/core';
import {User} from './user';
import {UserJson} from './user-json';
import {GenericService} from '../generics/generic-service';

/**
 * Load customer's user information from a spreadsheet.
 * Augment edit or augment it.
 * Develop map from "researcher" or "pi" information for stocks
 * to these users.
 *
 * We expect info on a "users" sheet in an input workbook.
 * We make use of fields for name, initials, email,  username, role,
 * isPrimaryInvestigator,  isResearcher, isActive
 *
 * **ALL OTHER COLUMNS ARE IGNORED** but there is no harm in having them
 */

@Injectable({
  providedIn: 'root'
})
export class UserService extends GenericService<User, UserJson>{

  override loadItems(usersFromWorksheet: UserJson[]) {
    for (const rawUser of usersFromWorksheet) {
      const user = new User();
      user.datafillFromJson(rawUser);
      this.list.push(user);
    }
  }

}
