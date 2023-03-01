import {Injectable} from '@angular/core';
import {AppStateService} from '../app-state.service';
import * as XLSX from 'xlsx';
import {GenericType} from './generic-type';
import {BehaviorSubject} from 'rxjs';
import {JsonForExcel} from './json-for-excel';
import {ObjectPatch} from '../shared/patching/object-patch';
import {PatternMapper} from '../string-mauling/pattern-mapper/pattern-mapper';
import {PatternMapperDto} from '../string-mauling/pattern-mapper/pattern-mapper-dto';

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
  _list: T[] = [];
  list: BehaviorSubject<T[]> = new BehaviorSubject<T[]>([]);

  protected _filteredList: T[] = [];
  filteredList: BehaviorSubject<T[]> = new BehaviorSubject<T[]>([]);

  _regExpFilter: RegExp | null = null;
  set regExpFilter(regexp: RegExp | null) {
    this._regExpFilter = regexp;
    this.filterList();
  }

  // The set of patterns that map to instances of this type
  private _patternMappers: PatternMapper<T>[] = [];
  patternMappers: BehaviorSubject<PatternMapper<T>[]> = new BehaviorSubject<PatternMapper<T>[]>([]);

  constructor(
    protected appState: AppStateService
  ) {
  }

  // sorting is type dependent so this should be overridden
  sortList() {
    this.list.next(this._list);
  }
  //  filtering is type dependent so this should be overridden
  filterList() {
    this._filteredList = this._list;
    this.filteredList.next(this._filteredList);
  }

  refreshUniqueNames() {
    const uniqueNames: string[] = [];
    this._list.map((item: T) => uniqueNames.push(item.id));
    this.uniqueNames.next(uniqueNames);
  }

  // In general items are loaded from a workbook. When starting out, there may be
  // no users or mutations or transgenes in the workbook, but the tool will build
  // them over successive sessions and save them in new versions of the workbook.
  // So, after to the first session, there will be users, transgenes and/or mutations
  // to load in subsequent sessions.
  loadFromWorkbook(wb: XLSX.WorkBook): void {
    this.loadItemsFromWorkBook(wb);

    // Load all the "in progress" patches from local storage.
    // If these patches were not saved, they get reapplied, if they were saved,
    // they go away from local memory.
    this.loadPatchesFromLocalStorage();

    // After loading, tell anyone who is listening to our main behavior subjects
    this.sortList();
    this.filterList();
    this.refreshUniqueNames();

    this._patternMappers = [];
    this.loadPatternMappersFromLocalStorage();
    this.loadPatternMappersFromWorkbook(wb);
    this.exportPatternMappers();

    this.afterLoadingFromWorkbook();
  }

  // Give derived classes a hook to do something after loading a worksheet.
  afterLoadingFromWorkbook(): void {}

  loadItemsFromWorkBook(wb: XLSX.WorkBook) {
    this._list = [];
    const ws = wb.Sheets[this.worksheetName];
    if (!ws) {
      this.loadingProblems.push(`Could not find worksheet: ${this.worksheetName}`);
      return;
    }

    // Create all the items of type T.
    this.loadJsonItems(XLSX.utils.sheet_to_json(ws));
  }

  abstract loadJsonItems(itemsFromWorksheet: JsonForExcel[]): void;
  loadPatchesFromLocalStorage(): void {
    // Load them up from local storage.
    const previouslyStoredPatches: { [index: string]: ObjectPatch } =
      this.appState.getState(this.localPatchStorageToken);

    if (previouslyStoredPatches && Object.keys(previouslyStoredPatches).length > 0) {
      // Loop through the stocks we loaded from the worksheet and apply the patches
      for (const item of this._list) {
        // See if there is/are patches matching on the unpatched stock name.
        // NOTE If there ar duplicates in the list and a matching patch,
        // then the patch will be applied to all the duplicate stocks.
        // The moral of the story - FIX DUPLICATES FIRST.  Thank you for your attention.
        item.applyPatch(previouslyStoredPatches[item.id]);
      }
    }
    // once all the patches are applied, re-save them.  Why?
    // Because that will rebuild the set of patches. So,
    // If you loaded a spreadsheet that included the patches, then the
    // patches that were waiting in memory will effectively be removed.
    // On the other hand if you reloaded an older version that did not
    // contain the in-memory patches, then the in-memory patches will
    // be re-applied then erased and re-calculated.
    this.savePatchesToLocalStorage();
  }

  loadPatternMappersFromLocalStorage() {
    this._patternMappers = [];
    const pmDtos: PatternMapperDto[] = this.appState.getState(this.localPatternMapperStorageToken);
    if (pmDtos) {
      this.loadJsonPatterns(pmDtos)
    }
  }

  loadPatternMappersFromWorkbook(wb: XLSX.WorkBook) {
    const ws = wb.Sheets[`${this.worksheetName}-patterns`];
    if (ws) {
      const pmDtos: PatternMapperDto[] = XLSX.utils.sheet_to_json(ws);
      if (pmDtos) {
        this.loadJsonPatterns(pmDtos);
      }
    }
  }

  // Here we reconstitute a pattern mapper from json that was stored elsewhere.
  // Specifically a worksheet or as an unsaved pattern in memory in the browser.
  // In some situations you may run across a mapper for the same pattern more than once.
  // We take the first and ignore the rest.
  loadJsonPatterns(pmDtos: PatternMapperDto[]) {
    pmDtos.map((pmDto: any) => {
      const regExpString = (pmDto.regExpString) ? pmDto.regExpString as string : '';

      // See if there is already a pattern mapper for this pattern
      const existingPatternMapper = (this._patternMappers.find((existingPm: PatternMapper<T>) =>
          existingPm.regExpString === regExpString
      ));

      // skip a pattern mapper if we already have a mapper for this pattern
      if (!existingPatternMapper) {
        const pm: PatternMapper<T> = new PatternMapper<T>(this);
        pm.reconstituteFromDto(pmDto);
        this._patternMappers.push(pm);
      }
    })
  }

  exportWorksheet(wb: XLSX.WorkBook) {
    // export item list to a worksheet
    const itemsJson: JsonForExcel[] = [];
    for (const item of this._list) {
      const json: JsonForExcel | null = item.extractJsonForExcel(item.originalInstance);
      if (json) itemsJson.push(json);
    }
    wb.SheetNames.push(this.worksheetName);
    wb.Sheets[this.worksheetName] = XLSX.utils.json_to_sheet(itemsJson);

    // Store pattern mappers if there are any.
    if (this.patternMappers.value.length > 0) {
      const patternWorksheetName = `${this.worksheetName}-patterns`
      wb.SheetNames.push(patternWorksheetName);
      wb.Sheets[patternWorksheetName] = XLSX.utils.json_to_sheet(this.getJsonPatterns());
    }
  }

  selectItem(item: T | null) {
    // ignore the selection if the item is not in the known list of items (or empty)
    if (item && this._list.includes(item)) {
      this._selected = item;
    } else if (this._list.length > 0) {
      this._selected = this._list[0];
    } else {
      this._selected = null;
    }
  }

  deleteItem(item: T) {
    const index = this._list.indexOf(item);
    if (index >= 0) {
      this._list.splice(index,1);
      this.filterList();
      this.refreshUniqueNames();
    }
    if (item === this._selected) {
      this.selectItem(null);
    }
  }


  addItem(newItem: T): void {
    this._list.push(newItem);
    this.selectItem(newItem);
    this.sortList();
    this.filterList();
    this.refreshUniqueNames();
  }



  // Used to validate uniqueness of an attribute value.
  // Check if any item in the list *except the item we are looking at* has the proposed new value
  attrValueExistsAlready(attrName: string, itemInQuestion: T, proposedValue: string): boolean {
    for (const u of this._list) {
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
    for (const item of this._list) {
      const objectPatch: ObjectPatch | null = item.extractPatch();
      if (objectPatch) objectPatches[item.id] = objectPatch;
    }
    this.appState.setState(this.localPatchStorageToken, objectPatches, true);
  }

  addPatternMapper(pm: PatternMapper<T>) {
    this._patternMappers.unshift(pm);
    this.saveAndExportPatternMappers();
  }

  createPatternMapper() {
    const pm = new PatternMapper<T>(this);
    if (this.selected?.id) {
      pm.setTargetFromIdString(this.selected.id);
    }
    this.addPatternMapper(pm);
  }

  deletePatternMapper(patternMapper: PatternMapper<T>) {
    const index = this._patternMappers.indexOf(patternMapper);
    if (index >= 0) {
      this._patternMappers.splice(index, 1);
      this.saveAndExportPatternMappers()
    }
  }

  movePatternMapper(pm: PatternMapper<T>, direction : 'up' | 'down' | 'top' | 'bottom' | number) {
    const index = this.patternMappers.value.indexOf(pm);
    const pms = this.patternMappers.value;
    // it only makes sense to proceed if the pm actually is in the list and there are at least two items in the list
    if (index > -1 && pms.length > 1) {
      pms.splice(index,1);
      const endIndex = pms.length -1;
      let targetIndex: number;
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
    this.appState.setState(this.localPatternMapperStorageToken, this.getJsonPatterns(), true);
    this.exportPatternMappers();
  }

  getJsonPatterns(): PatternMapperDto[] {
    return this._patternMappers.map((pm: PatternMapper<T>) => { return pm.dto;})
  }

  exportPatternMappers() {
    this.patternMappers.next(this._patternMappers);
  }

  findById(id: string): T | undefined {
    if (!id) {
      return undefined;
    }
    return this._list.find((item: T) => item.id === id)
  }

  getMatchesForSelected(): {[index: string]: string[]} {
  const matches: {[index: string]: string[]} = {};
  if (!this.selected) return matches;
  for (const pm of this.patternMappers.value) {
    if (pm.target === this.selected) {
      for (const [string, matchList] of Object.entries(pm.matches)) {
        matches[string] = matchList;
      }
    }
  }
  return matches;
  }
}
