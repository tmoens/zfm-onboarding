import { Injectable } from '@angular/core';
import {User, UserRole} from './user';
import {AppStateService} from '../app-state.service';
import {UserJson} from './user-json';
import * as XLSX from 'xlsx';
import {instanceToPlain} from 'class-transformer';

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

const WORKSHEET_NAME = 'users';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // The set of problems we run into loading data from the "users" worksheet.
  // These are not specific to any one user, but more about the problems with
  // the sheet as a whole.
  loadingProblems: string[] = [];

  private _selected: User | null = null;
  get selected(): User | null {
    return this._selected;
  }

  // The set of users
  list: User[] = [];

  constructor(
    private appState: AppStateService,
  ) {
  }

  loadWorksheet(wb: XLSX.WorkBook) {
    this.list = [];

    const ws = wb.Sheets[WORKSHEET_NAME];
    if (!ws) {
      this.loadingProblems.push(`Could not find worksheet: ${WORKSHEET_NAME}.`);
      return;
    }

    this.loadUsers(XLSX.utils.sheet_to_json(ws));
  }

  loadUsers(usersFromWorksheet: UserJson[]) {
    for (const rawUser of usersFromWorksheet) {
      const user = new User();
      user.datafillFromJson(rawUser);
      this.list.push(user);
    }
  }

  exportWorksheet(wb: XLSX.WorkBook) {
    const data: UserJson[] = [];
    for (const user of this.list) {
      data.push(instanceToPlain(user) as UserJson);
    }
    wb.SheetNames.push(WORKSHEET_NAME);
    wb.Sheets[WORKSHEET_NAME] = XLSX.utils.json_to_sheet(data);
  }

  select(item: User | null) {
    // ignore the selection if the item is not in the known list of items (or empty)
    if (item && this.list.includes(item)) {
      this._selected = item;
    } else {
      this._selected = null;
    }
  }

  add(item: User) {
    if (item.isValid()) {
      this.list.push(item)
    }
  }

  delete(item: User) {
    const index = this.list.indexOf(item);
    if (index >= 0) this.list.splice(index,1);
    if (item === this._selected) {
      this.select(null);
    }
  }
}
