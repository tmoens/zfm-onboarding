// A Stock is a record of data about a stock that is tidied up
// The general idea is that this gets refined as we add more "corrections" for
// converting the raw stocks to stocks that are ready for import into a zsm system.

import {StockData} from './stock-data';
import {ProblemType} from './stock-problems';
import {StockAttr} from './stockAttr';

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
  private _duplicates: number[] = [];

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
    this.stockName.original = originalStock.stockName;
    if (!originalStock.stockName) {
      this.stockName.addProblem(ProblemType.MISSING);
    } else {
      if (!Stock.validateStockName(this.stockName.original)) {
        this.stockName.addProblem(ProblemType.INVALID);
      }
    }
    this.stockName.current = this.stockName.original;

    // The DOB is expected to be present and to be an excel date serial number or a date string.
    // Also, we are going to normalize the raw stock's dob into a date string if possible.
    if (!this.originalStock.dob) {
      this.dob.addProblem(ProblemType.MISSING);
    } else if (isNaN(Number(originalStock.dob))) {
      // if the dob is not a number, try to convert from date string
      const t = Date.parse(String(originalStock.dob));
      if (isNaN(t)) {
        // Date.parse can't parse the string into a date. So, the given date is invalid.
        this.dob.original = this.originalStock.dob;
        this.dob.addProblem(ProblemType.INVALID);
      } else {
        this.dob.original = new Date(t).toISOString().substring(0,10);
      }
    } else {
      this.dob.original = new Date(Date.UTC(0,0, Number(originalStock.dob) -1)).toISOString().substring(0, 10);
    }
    this.dob.current = this.dob.original;

    // if they have values, mom and dad should be valid stock numbers (if they are internal stocks)
    this.internalMom.original = (originalStock.internalMom) ? String(originalStock.internalMom).trim() : '';
    if (this.internalMom.original && !Stock.validateStockName(this.internalMom.original)) {
        this.internalMom.addProblem(ProblemType.INVALID);
    }
    this.internalMom.current = this.internalMom.original;

    this.internalDad.original = (originalStock.internalDad) ? String(originalStock.internalDad).trim() : '';
    if (this.internalDad.original && !Stock.validateStockName(this.internalDad.original)) {
        this.internalDad.addProblem(ProblemType.INVALID);
    }
    this.internalDad.current = this.internalDad.original;

    // Nursery counts have to be numbers
    this.countEnteringNursery.original = (originalStock.countEnteringNursery) ? String(originalStock.countEnteringNursery).trim() : '';
    if (isNaN(Number(this.countEnteringNursery.original))) this.countEnteringNursery.addProblem(ProblemType.INVALID);
    this.countEnteringNursery.current = this.countEnteringNursery.original;

    this.countLeavingNursery.original = (originalStock.countLeavingNursery) ? String(originalStock.countLeavingNursery).trim() : '';
    if (isNaN(Number(this.countLeavingNursery.original))) this.countLeavingNursery.addProblem(ProblemType.INVALID);
    this.countLeavingNursery.current = this.countLeavingNursery.original;

    // No context-free validation can be done on these.
    this.genetics.original = (originalStock.genetics) ? String(originalStock.genetics).trim() : '';
    this.genetics.current = this.genetics.original;
    this.comment.original = (originalStock.comment) ? String(originalStock.comment).trim() : '';
    this.comment.current = this.comment.original;
    this.researcher.original = (originalStock.researcher) ? String(originalStock.researcher).trim() : '';
    this.researcher.current = this.researcher.original;
    this.externalMom.original = (originalStock.externalMom) ? String(originalStock.externalMom).trim() : '';
    this.externalMom.current = this.externalMom.original;
    this.externalDad.original = (originalStock.externalDad) ? String(originalStock.externalDad).trim() : '';
    this.externalDad.current = this.externalDad.original;
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
    return !!(this.originalStock.stockName && this.originalStock.stockName === name);
  }

  get duplicates(): number[] {
    return this._duplicates;
  }

  get duplicatesAsString(): string {
    return this._duplicates.join(', ');
  }

  set duplicates(rowNumbers: number[]) {
    this._duplicates = rowNumbers;
    this.stockName.addProblem(ProblemType.DUPLICATE);
  }

  hasDuplicates(): boolean {
    return (this.duplicates.length > 0);
  }

  static validateStockName(putativeName: string): boolean {
    return stockNameRE.test(putativeName);
  }

  static validateDobString(putativeName: string): boolean {
    return RegExp(/^\d{4}-\d{2}-\d{2}$/).test(putativeName);
  }

  youngerThan(dobString: string): boolean {
    return (!this.dob.current || (this.dob.current >= dobString));
  }

  hasProblems(unPatchedProblemsOnly: boolean = true): boolean {
    return (
      this.stockName.hasProblems(unPatchedProblemsOnly) ||
      this.dob.hasProblems(unPatchedProblemsOnly) ||
      this.internalMom.hasProblems(unPatchedProblemsOnly) ||
      this.internalDad.hasProblems(unPatchedProblemsOnly) ||
      this.countEnteringNursery.hasProblems(unPatchedProblemsOnly) ||
      this.countLeavingNursery.hasProblems(unPatchedProblemsOnly)
    )
  }
}
