import {Injectable} from '@angular/core';
import {GenericService} from '../generics/generic-service';
import {JsonForExcel} from '../generics/json-for-excel';
import {Transgene} from './tg';

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
export class TransgeneService extends GenericService<Transgene>{
  localPatternMapperStorageToken = 'tgPatterns'
  localPatchStorageToken = 'tgPatches';
  worksheetName = 'transgenes';
  newItem: Transgene | null = null;

  override loadItems(itemsFromWorksheet: JsonForExcel[]) {
    for (const jsonTg of itemsFromWorksheet) {
      const tg = new Transgene();
      tg.datafillFromJson(jsonTg);
      this.list.push(tg);
    }
    this.loadPatchesFromLocalStorage();
  }


  create(): void {
    this.newItem = new Transgene();
  }

  override select(item: Transgene | null) {
    super.select(item);
    // auto wipe out a new user if it was being added. No big deal.
    this.newItem = null;
  }

  add(): void {
    if (this.newItem) {
      this.list.push(this.newItem);
      this.select(this.newItem);
      this.newItem = null;
    }
  }


}
