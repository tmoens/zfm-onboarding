import {Injectable} from '@angular/core';
import {AppStateService} from '../app-state.service';
import * as XLSX from 'xlsx';
import {GenericType} from './generic-type';
import {BehaviorSubject} from 'rxjs';
import {JsonForExcel} from './json-for-excel';
import {ObjectPatch} from './object-patch';
import {PatternMapper} from '../string-mauling/pattern-mapper/pattern-mapper';
import {instanceToPlain, plainToInstance} from 'class-transformer';

@Injectable({
  providedIn: 'root'
})
export abstract class GenericService<T extends GenericType> {

  abstract localPatternMapperStorageToken: string;
  abstract localPatchStorageToken: string;
  abstract worksheetName: string;
  // a list of the unique names of all the items in the list.
  // It is used in pattern mapping. A pattern in a text field maps to one of these unique names.
  uniqueNames: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

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

  // The set of patterns that map to instances of this type
  private _patternMappers: PatternMapper[] = [];
  patternMappers: BehaviorSubject<PatternMapper[]> = new BehaviorSubject<PatternMapper[]>([]);

  constructor(
    protected appState: AppStateService
  ) {
  }

  loadWorksheet(wb: XLSX.WorkBook): void {
    this.list = [];
    const ws = wb.Sheets[this.worksheetName];
    if (!ws) {
      this.loadingProblems.push(`Could not find worksheet: ${this.worksheetName}`);
      return;
    }

    // Create all the items of type T.
    this.loadItems(XLSX.utils.sheet_to_json(ws));

    // Load all the "in progress" patches from local storage.
    this.loadPatchesFromLocalStorage();

    this.refreshUniqueNames();

    this.loadPatternMappers();

    this.afterLoadWorksheet();
  }

  // Give derived classes a hook to do something after loading a worksheet.
  afterLoadWorksheet() : void {

  }
  abstract loadItems(itemsFromWorksheet: JsonForExcel[]): void;
  loadPatchesFromLocalStorage(): void {
    // Load them up from local storage.
    const previouslyStoredPatches: { [index: string]: ObjectPatch } =
      this.appState.getState(this.localPatchStorageToken);

    if (previouslyStoredPatches) {
      // Loop through the stocks we loaded from the worksheet and apply the patches
      for (const item of this.list) {
        // See if there is/are patches matching on the unpatched stock name.
        // NOTE If there ar duplicates in the stock list and a matching patch,
        // then the patch will be applied to all the duplicate stocks.
        // The moral of the story - FIX DUPLICATES FIRST.  Thank you for your attention.
        item.applyPatch(previouslyStoredPatches[item.uniqueName]);
      }
    }
  }


  // TODO Add extra fields from "originalObject"
  exportWorksheet(wb: XLSX.WorkBook) {
    const data: JsonForExcel[] = [];
    for (const item of this.list) {
      const json: JsonForExcel | null = item.extractJsonForExcel();
      if (json) data.push(json);
    }
    wb.SheetNames.push(this.worksheetName);
    wb.Sheets[this.worksheetName] = XLSX.utils.json_to_sheet(data);
  }

  select(item: T | null) {
    // ignore the selection if the item is not in the known list of items (or empty)
    if (item && this.list.includes(item)) {
      this._selected = item;
    } else if (this.list.length > 0) {
      this._selected = this.list[0];
    } else {
      this._selected = null;
    }
  }

  delete(item: T) {
    const index = this.list.indexOf(item);
    if (index >= 0) {
      this.list.splice(index,1);
      this.refreshUniqueNames();
    }
    if (item === this._selected) {
      this.select(null);
    }
  }


  add(newItem: T): void {
    this.list.push(newItem);
    this.select(newItem);
  }


  refreshUniqueNames() {
    const uniqueNames: string[] = [];
    this.list.map((item: T) => uniqueNames.push(item.uniqueName));
    this.uniqueNames.next(uniqueNames);
  }

  // Used to validate uniqueness of an attribute value.
  // Check if any item in the list *except the item we are looking at* has the proposed new value
  attrValueExistsAlready(attrName: string, itemInQuestion: T, proposedValue: string): boolean {
    for (const u of this.list) {
      if (u !== itemInQuestion && proposedValue === u.getPatchableAttrValue(attrName)) {
        return true;
      }
    }
    return false;
  }

  savePatchesToLocalStorage(): void {

    const objectPatches: {[index: string]: ObjectPatch} = {};
    // NOTE if there are items with duplicate names, only the patch for the
    // last one in the list will be saved.
    // The moral of the story - FIX DUPLICATES FIRST.  Thank you for your attention.
    for (const item of this.list) {
      const objectPatch: ObjectPatch | null = item.extractPatch();
      if (objectPatch) objectPatches[item.uniqueName] = objectPatch;
    }
    this.appState.setState(this.localPatchStorageToken, objectPatches, true);
  }

  addPatternMapper(pm: PatternMapper) {
    this._patternMappers.push(pm);
    this.saveAndExportPatternMappers();
  }

  loadPatternMappers() {
    this._patternMappers = [];
    const storedPlainPatterns = this.appState.getState(this.localPatternMapperStorageToken);
    if (storedPlainPatterns) {
      storedPlainPatterns.map((plainPattern: any) => {
        const pm: PatternMapper = plainToInstance(PatternMapper, plainPattern);
        pm.makeRegExpFromString();
        this._patternMappers.push(pm);
      })
    }
    this.exportPatternMappers();
  }

  createPatternMapper() {
    this.addPatternMapper(new PatternMapper());
  }

  deletePatternMapper(patternMapper: PatternMapper) {
    const index = this._patternMappers.indexOf(patternMapper);
    if (index >= 0) {
      this._patternMappers.splice(index, 1);
      this.saveAndExportPatternMappers()
    }
  }

  movePatternMapper(pm: PatternMapper, direction : 'up' | 'down' | 'top' | 'bottom' | number) {
    const index = this.patternMappers.value.indexOf(pm);
    const pms = this.patternMappers.value;
    // it only makes sense to proceed if the pm actually is in the list and there are at least two items in the list
    if (index > -1 && pms.length > 1) {
      pms.splice(index,1);
      const endIndex = pms.length -1;
      let targetIndex = 0;
      switch (direction) {
        case 'top':
          targetIndex = 0;
          break;
        case 'bottom':
          targetIndex = endIndex + 1;
          break;
        case 'up':
          targetIndex = index - 1;
          break;
        case 'down':
          targetIndex = index + 1;
          break;
        default:
          targetIndex = index + direction;
      }
      if (targetIndex < 0) {targetIndex = 0}
      if (targetIndex > endIndex + 1) { targetIndex = endIndex + 1}
      pms.splice(targetIndex, 0, pm);
      this.saveAndExportPatternMappers();
    }
  }

  saveAndExportPatternMappers() {
    const plainPatterns: any[] = [];
    this._patternMappers.map((pm: PatternMapper) => {
      pm.clearResults();
      plainPatterns.push(instanceToPlain(pm));
    })
    this.appState.setState(this.localPatternMapperStorageToken, plainPatterns, true);
    this.exportPatternMappers();
  }

  exportPatternMappers() {
    this.patternMappers.next(this._patternMappers);
  }



}
