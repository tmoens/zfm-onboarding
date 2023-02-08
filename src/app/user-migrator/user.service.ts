import {Injectable} from '@angular/core';
import {User} from './user';
import {GenericService} from '../generics/generic-service';
import {JsonForExcel} from '../generics/json-for-excel';

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
export class UserService extends GenericService<User>{
  localPatternMapperStorageToken = 'userPatterns'
  localPatchStorageToken = 'userPatches';
  worksheetName = 'users';
  newUser: User | null = null;

  override loadItems(usersFromWorksheet: JsonForExcel[]) {
    for (const rawUser of usersFromWorksheet) {
      const user = new User();
      user.datafillFromJson(rawUser);
      this.list.push(user);
    }
    this.loadPatchesFromLocalStorage();
  }


  createUser(): void {
    this.newUser = new User();
  }

  override select(item: User | null) {
    super.select(item);
    // auto wipe out a new user if it was being added. No big deal.
    this.newUser = null;
  }

  addUser(): void {
    if (this.newUser) {
      this.list.push(this.newUser);
      this.select(this.newUser);
      this.newUser = null;
    }
  }


}
