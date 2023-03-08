import {Injectable} from '@angular/core';
import {User} from './user';
import {GenericService} from '../generics/generic-service';
import {JsonForExcel} from '../generics/json-for-excel';
import * as XLSX from 'xlsx';

/**
 * Load customer's user information from a spreadsheet. Augment or edit it.
 * Develop map from "researcher" or "pi" information for stocks to these users.
 **/
@Injectable({
  providedIn: 'root'
})
export class PiService extends GenericService<User>{
  serviceName = 'pi';
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

  override exportWorksheet(wb: XLSX.WorkBook) {
    // for PIs we do not export the "users" worksheet, just the patterns.
    // The Researchers service takes care of the "users" worksheet.
    // It is a hack because I initially thought users=researchers, but Pis are also users.
    // Anyway, this kludge works.

    // Store pattern mappers if there are any.
    if (this.patternMappers.value.length > 0) {
      wb.SheetNames.push(this.localStoragePatternMapToken);
      wb.Sheets[this.localStoragePatternMapToken] = XLSX.utils.json_to_sheet(this.getJsonPatterns());
    }
  }

}


