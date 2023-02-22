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

  override loadJsonItems(itemsFromWorksheet: JsonForExcel[]) {
    for (const jsonTg of itemsFromWorksheet) {
      const tg = new Tg();
      tg.datafillFromJson(jsonTg);
      // Icky - while loading items we do not use the "add" method because that triggers
      // re-sorting, re-filtering and re-exporting data.
      this._list.push(tg);
    }
  }

  override sortList() {
    this._list.sort((tg1: Tg, tg2: Tg) => {
      if (tg1.descriptor.current.toLowerCase() > tg2.descriptor.current.toLowerCase()) {
        return 1;
      } else {
        return -1;
      }
    })
    this.flexList.next(this._list);
  }

  override filterList() {
    if (this._regExpFilter) {
      this._filteredList = this._list.filter((tg: Tg) => {
        return (this._regExpFilter?.test(tg.descriptor.current) ||
          this._regExpFilter?.test(tg.allele.current) ||
          this._regExpFilter?.test(tg.nickname.current));
      })
    }
    this.filteredList.next(this._filteredList);
  }
}
