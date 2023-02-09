// A Stock is a record of data about a stock that is tidied up
// The general idea is that this gets refined as we add more "corrections" for
// converting the raw stocks to stocks that are ready for import into a zsm system.

import {PatchableAttr} from '../shared/patching/patchable-attr';
import {StockService} from './stock.service';
import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {GenericType} from '../generics/generic-type';
import {JsonForExcel} from '../generics/json-for-excel';
import {PatternMapper} from '../string-mauling/pattern-mapper/pattern-mapper';

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
  researcherUsername: PatchableAttr = new PatchableAttr();
  piUsername: PatchableAttr = new PatchableAttr();
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

  constructor(
    private service: StockService,
    ) {
    super();
  }

  getPatchableAttrValue(attrName: string): string | null {
    if (this[attrName as keyof Stock] && this[attrName as keyof Stock] instanceof PatchableAttr) {
      return (this[attrName as keyof Stock] as PatchableAttr).current;
    }  else {
      return null;
    }
  }

  override datafillFromJson(originalStock: JsonForExcel) {
    // Do the generic datafill, then play mucky maulers with a couple of attributes
    super.datafillFromJson(originalStock);


    // Please look the other way for a moment while I get out my cudgel.
    // A stock number like 1660.10 (as unusual as it would be) looks
    // like a number and sure enough it gets converted to 1660.1 when it
    // comes in from the spreadsheet. So, we convert it to a string, and
    // we tack on a 0 for such cases;
    if (this.stockName.original) {
      const snTest = stockNameRE.exec(this.stockName.original);
      if (snTest && snTest[2] && snTest[2].length === 1) {
        this.stockName.initialize(this.stockName.original + '0');
      }
    }

    // The DOB is expected to be present and to be an Excel date serial number or a date string.
    // Also, we are going to normalize the raw stock's dob into a date string if possible.
    if (this.dob.original) {
      if (isNaN(Number(this.dob.original))) {
        // if the dob is not a number, try to convert from date string
        const t = Date.parse(String(this.dob.original));
        if (!isNaN(t)) {
          this.dob.initialize(new Date(t).toISOString().substring(0, 10));
        }
      } else {
        this.dob.initialize(new Date(Date.UTC(0, 0, Number(this.dob.original) - 1)).toISOString().substring(0, 10));
      }
    }
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

  isValid(): boolean {
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
  validate(): void {
    this.stockName.setValidity(!ValidateStockName(this.service, this, this.stockName.current));
    this.dob.setValidity(!ValidateDob(this.dob.current));
    this.mom.setValidity(!ValidateParent(this.service, this, this.mom.current));
    this.dad.setValidity(!ValidateParent(this.service, this, this.dad.current));
  }
  applyUserPatternMappers(patternMappers: PatternMapper[] = []) {
    for (const pm of patternMappers) {
      const target: string = pm.mapStringToTarget(this.researcher.original);
      if (target) {
        this.researcherUsername.update(target);
        // take the first match and run.
        return;
      }
    }
  }
  applyTgPatternMappers(patternMappers: PatternMapper[] = []): string {
    const transgenes: string[] = []
    for (const pm of patternMappers) {
      const target: string = pm.mapStringToTarget(this.genetics.original);
      if (target) { transgenes.push(target)
      }
    }
    return transgenes.join(';');
  }

  get uniqueName(): string {
    return this.stockName.current;
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
