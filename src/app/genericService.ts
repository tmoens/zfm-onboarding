import {Injectable} from '@angular/core';
import {AppStateService} from './app-state.service';
import * as XLSX from 'xlsx';
import {instanceToPlain} from 'class-transformer';
import {GenericType} from './genericType';

@Injectable({
  providedIn: 'root'
})
export class GenericService<T extends GenericType, TJson> {
  // The set of problems we run into loading items from the worksheet.
  // These are not specific to any one item, but more about the problems with
  // the sheet as a whole.
  loadingProblems: string[] = [];

  private _selected: T | null = null;
  get selected(): T | null {
    return this._selected;
  }

  // The set of items
  list: T[] = [];

  constructor(
    protected appState: AppStateService
  ) {
  }

  loadWorksheet(wb: XLSX.WorkBook, worksheetName: string) {
    this.list = [];
    const ws = wb.Sheets[worksheetName];
    if (!ws) {
      this.loadingProblems.push(`Could not find worksheet: ${worksheetName}`);
      return;
    }
    this.loadItems(XLSX.utils.sheet_to_json(ws));
  }

  loadItems(itemsFromWorksheet: TJson[]) {
    //needs to be overridden for each service.
  }

  exportWorksheet(wb: XLSX.WorkBook, worksheetName: string) {
    const data: TJson[] = [];
    for (const item of this.list) {
      data.push(instanceToPlain(item) as TJson);
    }
    wb.SheetNames.push(worksheetName);
    wb.Sheets[worksheetName] = XLSX.utils.json_to_sheet(data);
  }

  select(item: T | null) {
    // ignore the selection if the item is not in the known list of items (or empty)
    if (item && this.list.includes(item)) {
      this._selected = item;
    } else {
      this._selected = null;
    }
  }

  add(item: T) {
    if (item.isValid()) {
      this.list.push(item)
    }
  }

  delete(item: T) {
    const index = this.list.indexOf(item);
    if (index >= 0) this.list.splice(index,1);
    if (item === this._selected) {
      this.select(null);
    }
  }
}
