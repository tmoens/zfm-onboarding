import {Injectable} from '@angular/core';
import {GenericService} from '../generics/generic-service';
import {JsonForExcel} from '../generics/json-for-excel';
import {Tg} from './tg';

/**
 * Load customer's transgene information from a spreadsheet. The user augments or edits it.
 * Develop map from "genetics" information for stocks to these transgenes.
 **/
@Injectable({
  providedIn: 'root'
})
export class TgService extends GenericService<Tg>{
  localPatternMapperStorageToken = 'tgPatterns'
  localPatchStorageToken = 'tgPatches';
  worksheetName = 'transgenes';

  override loadItems(itemsFromWorksheet: JsonForExcel[]) {
    for (const jsonTg of itemsFromWorksheet) {
      const tg = new Tg();
      tg.datafillFromJson(jsonTg);
      this.list.push(tg);
    }
    this.loadPatchesFromLocalStorage();
  }
}
