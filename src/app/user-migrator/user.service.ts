import {Injectable} from '@angular/core';
import {User} from './user';
import {GenericService} from '../generics/generic-service';
import {JsonForExcel} from '../generics/json-for-excel';

/**
 * Load customer's user information from a spreadsheet. Augment or edit it.
 * Develop map from "researcher" or "pi" information for stocks to these users.
 **/
@Injectable({
  providedIn: 'root'
})
export class UserService extends GenericService<User>{
  localPatternMapperStorageToken = 'userPatterns'
  localPatchStorageToken = 'userPatches';
  worksheetName = 'users';

  override loadJsonItems(usersFromWorksheet: JsonForExcel[]) {
    for (const rawUser of usersFromWorksheet) {
      const user = new User();
      user.datafillFromJson(rawUser);
      this.addItem(user);
    }
    this.loadPatchesFromLocalStorage();
  }
}
