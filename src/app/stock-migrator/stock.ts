// A Stock is a record of data about a stock that is tidied up
// The general idea is that this gets refined as we add more "corrections" for
// converting the raw stocks to stocks that are ready for import into a zsm system.

import {StockJson} from './stock-json';
import {PatchableAttr} from '../generics/patchable-attr';
import {StockService} from './stock.service';
import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {StockPatch} from './stock-patch';
import {AttrPatch} from '../generics/attr-patch';
import {GenericType} from '../generics/generic-type';

// stock name look like this 121 or 4534.01 or 34.10
// In general, some digits designating the stock number sometimes
// followed by a dot and a two digit sub-stock number
// The following regular expression is used to validate a
// stock name and extract the stock number and substock number.
export const stockNameRE = RegExp(/^(\d+)\.?(\d{1,2})?$/);

export class Stock extends GenericType {
  stockName: PatchableAttr = new PatchableAttr();
  dob: PatchableAttr = new PatchableAttr();
  mom: PatchableAttr = new PatchableAttr();
  dad: PatchableAttr = new PatchableAttr();
  countEnteringNursery: PatchableAttr = new PatchableAttr();
  countLeavingNursery: PatchableAttr = new PatchableAttr();
  researcher: PatchableAttr = new PatchableAttr();
  genetics: PatchableAttr = new PatchableAttr();
  comment: PatchableAttr = new PatchableAttr();

  originalStock: StockJson | null = null;
  private _row: number | null = null;
  set row(value: number | null) {
    this._row = value;
  }
  get row(): number {
    if (this._row) return this._row;
    return this._row ?? -1;
  }
  // in the worksheet the first stock appears on row 2.
  // If you are putting them in an array, you want to start at index of 0;
  get index(): number {
    return this.row - 2;
  }

  hasDuplicates(): boolean {
    return (this._duplicates.length > 0);
  }
  setDuplicates(duplicates: number[]) {
    this._duplicates = duplicates;
  }
  private _duplicates: number[] = [];


  override datafillFromJson(originalStock: StockJson) {
    this.originalStock = originalStock;
    this.stockName.original = (originalStock.stockName) ? String(originalStock.stockName).trim() : '';
    // Please look the other way for a moment while I get out my cudgel.
    // A stock number like 1660.10 (as unusual as it would be) looks
    // like a number and sure enough it gets converted to 1660.1 when it
    // comes in from the spreadsheet. So, we convert it to a string, and
    // we tack on a 0 for such cases;
    if (this.stockName.original) {
      const snTest = stockNameRE.exec(this.stockName.original);
      if (snTest && snTest[2] && snTest[2].length === 1) {
        this.stockName.original = this.stockName.original + '0';
      }
      this.stockName.current = this.stockName.original;
    }

    // The DOB is expected to be present and to be an Excel date serial number or a date string.
    // Also, we are going to normalize the raw stock's dob into a date string if possible.
    this.dob.original = (originalStock.dob) ? String(originalStock.dob).trim() : '';
    if (this.dob.original) {
      if (isNaN(Number(this.dob.original))) {
        // if the dob is not a number, try to convert from date string
        const t = Date.parse(String(this.dob.original));
        if (isNaN(t)) {
          // Date.parse can't parse the string into a date. So, the given date is invalid.
          this.dob.original = this.dob.original;
        } else {
          this.dob.original = new Date(t).toISOString().substring(0, 10);
        }
      } else {
        this.dob.original = new Date(Date.UTC(0, 0, Number(this.dob.original) - 1)).toISOString().substring(0, 10);
      }
    }
    this.dob.current = this.dob.original;

    // For other fields we just take them as they are
    this.mom.original = (originalStock.mom) ? String(originalStock.mom).trim() : '';
    this.mom.current = this.mom.original;

    this.dad.original = (originalStock.dad) ? String(originalStock.dad).trim() : '';
    this.dad.current = this.dad.original;

    this.countEnteringNursery.original = (originalStock.countEnteringNursery) ? String(originalStock.countEnteringNursery).trim() : '';
    this.countEnteringNursery.current = this.countEnteringNursery.original;

    this.countLeavingNursery.original = (originalStock.countLeavingNursery) ? String(originalStock.countLeavingNursery).trim() : '';
    this.countLeavingNursery.current = this.countLeavingNursery.original;

    this.genetics.original = (originalStock.genetics) ? String(originalStock.genetics).trim() : '';
    this.genetics.current = this.genetics.original;

    this.comment.original = (originalStock.comment) ? String(originalStock.comment).trim() : '';
    this.comment.current = this.comment.original;

    this.researcher.original = (originalStock.researcher) ? String(originalStock.researcher).trim() : '';
    this.researcher.current = this.researcher.original;
  }

  extractPatch(): StockPatch | null {
    const patch: StockPatch = {}
    let p: AttrPatch | null;
    p = this.stockName.extractPatch();
    if (p !== null) {patch.stockName = p;}
    p = this.dob.extractPatch();
    if (p !== null) {patch.dob = p;}
    p = this.mom.extractPatch();
    if (p !== null) {patch.mom = p;}
    p = this.dad.extractPatch();
    if (p !== null) {patch.dad = p;}
    p = this.countEnteringNursery.extractPatch();
    if (p !== null) {patch.countEnteringNursery = p;}
    p = this.countLeavingNursery.extractPatch();
    if (p !== null) {patch.countLeavingNursery = p;}
    p = this.comment.extractPatch();
    if (p !== null) {patch.comment = p;}
    p = this.genetics.extractPatch();
    if (p !== null) {patch.genetics = p;}
    if (Object.keys(patch).length > 0) {
      return patch;
    } else {
      return null;
    }
  }

  extractJsonForExcel(): StockJson | null {
    const json: StockJson | null = this.originalStock;
    if (json) {
      const notes: string[] = [];
      if (this.comment.current) {
        notes.push(this.comment.current);
      }
      if (this.stockName.isPatched()) {
        notes.push(`number changed from ${this.stockName.original}`)
        json.stockName = this.stockName.current;
      }
      if (this.dob.isPatched()) {
        notes.push(`dob changed from ${this.dob.original}`)
        json.dob = this.dob.current;
      }
      if (this.mom.isPatched()) {
        notes.push(`mom changed from ${this.mom.original}`)
        json.mom = this.mom.current;
      }
      if (this.dad.isPatched()) {
        notes.push(`dad changed from ${this.dad.original}`)
        json.dad = this.dad.current;
      }
      if (this.countEnteringNursery.isPatched()) {
        notes.push(`countEnteringNursery changed from ${this.countEnteringNursery.original}`)
        json.countEnteringNursery = this.countEnteringNursery.current;
      }
      if (this.countLeavingNursery.isPatched()) {
        notes.push(`countLeavingNursery changed from ${this.countLeavingNursery.original}`)
        json.countLeavingNursery = this.countLeavingNursery.current;
      }
      if (this.researcher.isPatched()) {
        notes.push(`researcher changed from ${this.researcher.original}`)
        json.researcher = this.researcher.current;
      }
      if (this.genetics.isPatched()) {
        notes.push(`genetics changed from ${this.genetics.original}`)
        json.genetics = this.genetics.current;
      }
      if (this.comment.isPatched()) {
        notes.push(`comment changed from ${this.comment.original}`)
        json.comment = this.comment.current;
      }
      json.comment = notes.join(`; `)
    }
    return json;
  }

  applyPatch(patch?: StockPatch) {
    if (patch) {
      this.stockName.applyPatch(patch.stockName);
      this.dob.applyPatch(patch.dob);
      this.mom.applyPatch(patch.mom);
      this.dad.applyPatch(patch.dad);
      this.countEnteringNursery.applyPatch(patch.countEnteringNursery);
      this.countLeavingNursery.applyPatch(patch.countLeavingNursery);
      this.genetics.applyPatch(patch.genetics);
      this.comment.applyPatch(patch.comment);
    }
  }

  get stockNumber(): number | undefined {
    if (!this.stockName.current) return undefined;
    const snTest = stockNameRE.exec(this.stockName.current);
    if (snTest) {
      return Number(snTest[1]);
    }
    return undefined;
  }

  get subStockNumber(): number | undefined {
    if (!this.stockName.current) return undefined;
    const snTest = stockNameRE.exec(this.stockName.current);
    if (snTest && snTest[2]) {
      return Number(snTest[2]);
    }
    return undefined;
  }

  isSubstock(): boolean{
    return (!!this.subStockNumber);
  }

  // when someone comes asking "are you stock 15.06?" answer yes or no.
  checkName(name: string): boolean {
    return (this.stockName && this.stockName.current === name);
  }

  static validateStockNameSyntax(putativeName: string): boolean {
    return stockNameRE.test(putativeName);
  }

  static validateDobString(putativeDob: string): boolean {
    return RegExp(/^\d{4}-\d{2}-\d{2}$/).test(putativeDob);
  }

  youngerThan(dobString: string): boolean {
    return (!this.dob.current || (this.dob.current >= dobString));
  }

  override isValid(): boolean {
    return (
      this.stockName.isValid() &&
      this.dob.isValid() &&
      this.mom.isValid() &&
      this.dad.isValid() &&
      this.countEnteringNursery.isValid() &&
      this.countLeavingNursery.isValid()
    )
  }

  // Checks the validity of all the fields of a stock
  validate(service: StockService): void {
    this.stockName.setValidity(!ValidateStockName(service, this, this.stockName.current));
    this.dob.setValidity(!ValidateDob(this.dob.current));
    this.mom.setValidity(!ValidateParent(service, this, this.mom.current));
    this.dad.setValidity(!ValidateParent(service, this, this.dad.current));
  }
}

export function ValidateStockNameFC(service: StockService, stock: Stock): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return ValidateStockName(service, stock, control.value)
  }
}

export function ValidateStockName(service: StockService, stock: Stock, proposedStockName?: string): ValidationErrors | null {
  if (!proposedStockName) {
    return {invalid: 'Stock name required'};
  } else {
    if (!Stock.validateStockNameSyntax(proposedStockName)) {
      return {invalid: 'must be:  digits[.twoDigits]'}
    }
    const dups: Stock[] = service.getStocksByName(proposedStockName);
    if (dups.length > 1 || (dups.length === 1 && (dups[0].index !== stock.index))) {
      const dupRows: number[] = [];
      for (const s of dups) {
        if (s.index !== stock.index) dupRows.push(s.row);
      }
      stock.setDuplicates(dupRows);
      return {invalid: `Duplicate in row(s): ${dupRows.join(', ')}`}
    } else {
      stock.setDuplicates([]);
    }
  }
  return null;
}

export function ValidateDobFC(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return ValidateDob(control.value);
  }
}

export function ValidateDob(proposedDob?: string): ValidationErrors | null {
  if (!proposedDob) {
    return {invalid: 'Fertilization date required'};
  } else {
    if (!Stock.validateDobString(proposedDob)) {
      return {invalid: 'Must be YYYY-MM-DD'}
    }
  }
  return null;
}

export function ValidateParentFC(service: StockService, stock?: Stock): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return ValidateParent(service, stock, control.value)
  }
}

export function ValidateParent(service: StockService, stock?: Stock, putativeParentName?: string): ValidationErrors | null {
  if (putativeParentName) {
    if (!Stock.validateStockNameSyntax(putativeParentName)) {
      return {invalid: 'must be:  digits[.twoDigits]'}
    }
    const candidates: Stock[] = service.getStocksByName(putativeParentName);
    if (candidates.length === 0) {
      return {invalid: 'Parent does not exist'}
    }
    if (candidates.length > 1) {
      return {invalid: `Ambiguous: multiple stocks ${putativeParentName}`}
    }
    if (candidates.length === 1 && candidates[0].index === stock?.index) {
      return {invalid: `Can't be your own parent`}
    } else {
      if (stock && stock.dob.current && candidates[0].youngerThan(stock.dob.current)) {
        return {invalid: 'Time travel alert! Older than parent'}
      }
    }
  }
  return null;
}
