// A Stock is a record of data about a stock that is tidied up
// The general idea is that this gets refined as we add more "corrections" for
// converting the raw stocks to stocks that are ready for import into a zsm system.

import {StockData} from './stock-data';
import {StockAttr} from './stockAttr';
import {StockService} from './stock.service';
import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

// stock name look like this 121 or 4534.01 or 34.10
// In general, some digits designating the stock number sometimes
// followed by a dot and a two digit sub-stock number
// The following regular expression is used to validate a
// stock name and extract the stock number and substock number.
export const stockNameRE = RegExp(/^(\d+)\.?(\d{1,2})?$/);

export class Stock {
  stockName: StockAttr = new StockAttr(true);
  dob: StockAttr = new StockAttr(true);
  internalMom: StockAttr = new StockAttr();
  internalDad: StockAttr = new StockAttr();
  externalMom: StockAttr = new StockAttr();
  externalDad: StockAttr = new StockAttr();
  countEnteringNursery: StockAttr = new StockAttr();
  countLeavingNursery: StockAttr = new StockAttr();
  researcher: StockAttr = new StockAttr();
  genetics: StockAttr = new StockAttr();
  comment: StockAttr = new StockAttr();

  get row(): number {
    return this._row;
  }
  // in the worksheet the first stock appears on row 2.
  // If you are putting them in an array, you want to start at index of 0;
  get index(): number {
    return this._row - 2;
  }

  constructor(
    private _row: number, // the row on the input spreadsheet that this stock was found on
    public originalStock: StockData,
  ) {
    this.stockName.original = (originalStock.stockName) ? String(originalStock.stockName).trim() : '';
    // Please look the other way for a moment while I get out my klugdel.
    // A stock number like 1660.10 (as unusual as it would be) looks
    // like a number and sure enough it gets converted to 1660.1 when it
    // comes in from the spreadsheet. So, we convert it to a string and
    // we tack on a 0 for such cases;
    if (this.stockName.original) {
      const snTest = stockNameRE.exec(this.stockName.original);
      if (snTest && snTest[2] && snTest[2].length === 1) {
        this.stockName.original = this.stockName.original + '0';
      }
      this.stockName.current = this.stockName.original;
    }

    // The DOB is expected to be present and to be an excel date serial number or a date string.
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
    this.internalMom.original = (originalStock.internalMom) ? String(originalStock.internalMom).trim() : '';
    this.internalMom.current = this.internalMom.original;
    this.externalMom.original = (originalStock.externalMom) ? String(originalStock.externalMom).trim() : '';
    this.externalMom.current = this.externalMom.original;

    this.internalDad.original = (originalStock.internalDad) ? String(originalStock.internalDad).trim() : '';
    this.internalDad.current = this.internalDad.original;
    this.externalDad.original = (originalStock.externalDad) ? String(originalStock.externalDad).trim() : '';
    this.externalDad.current = this.externalDad.original;

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

  isValid(): boolean {
    return (
      this.stockName.isValid() &&
      this.dob.isValid() &&
      this.internalMom.isValid() &&
      this.internalDad.isValid() &&
      this.countEnteringNursery.isValid() &&
      this.countLeavingNursery.isValid()
    )
  }

  // Checks the validity of all the fields of a stock
  validate(service: StockService): void {
    this.stockName.setValidity(!ValidateStockName(service, this, this.stockName.current));
    this.dob.setValidity(!ValidateDob(this.dob.current));
    this.internalMom.setValidity(!ValidateParent(service, this, this.internalMom.current));
    this.internalDad.setValidity(!ValidateParent(service, this, this.internalDad.current));
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
      return {invalid: `Stock name exists in row(s): ${dupRows.join(', ')}`}
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
      return {invalid: `Ambiguous, multiple stocks called ${putativeParentName}`}
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
