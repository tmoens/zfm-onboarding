// A Stock is a record of data about a stock that is tidied up
// The general idea is that this gets refined as we add more "corrections" for
// converting the raw stocks to stocks that are ready for import into a zsm system.


import {StockProblem, StockProblemType} from './StockProblem';

// stock name look like this 121 or 4534.01 or 34.10
// In general, some digits designating the stock number sometimes
// followed by a dot and a two digit sub-stock number
// The following regular expression is used to validate a
// stock name and extract the stock number and substock number.
const stockNameRE = RegExp(/^(\d+)\.?(\d{1,2})?$/);

export class Stock {
  get row(): number {
    return this._row;
  }
  // in the worksheet the first stock appears on row 2.
  // If you are putting them in an array, you want to start at index of 0;
  get index(): number {
    return this._row - 2;
  }
  // we use the array index as the stock id.
  get id(): number {
    return this.index;
  }

  get stockName(): string | undefined {
    return this._stockName;
  }
  set stockName(value: string | undefined) {
    this._stockName = value;
  }
  private _stockName?: string; // e.g. 2301 or 1744 - i.e. nu substock number

  get stockNumber(): number | undefined {
    return this._stockNumber;
  }
  private _stockNumber?: number; // e.g. 2301 or 1744 - i.e. nu substock number

  get subStockNumber(): number | undefined {
    return this._subStockNumber;
  }
  private _subStockNumber?: number; // eg 0, 1, 2,

  dob?: string = '';  // fertilization date as a string
  countEnteringNursery?: number;
  countLeavingNursery?: number;
  researcher?: string;
  internalMom?: string;  // Best case is the id of a younger stock, but who knows
  internalDad?: string;
  externalMom?: string;
  externalDad?: string;
  rawGenetics?: string = ''; // a string that contains ad-hoc identifiers for the markers carried by the stock
  mutations?: string[] = [];
  transgenes?: string[] = [];
  comment?: string; // some comment specific to the stock
  problems: StockProblem[] = [];

  constructor(
    private _row: number, // the row on the input spreadsheet that this stock was found on
    private rawStock?: any,
  ) {
    if (!rawStock) {
      return;
    }
    if (!rawStock.stockName) {
      this.addProblem(new StockProblem(StockProblemType.BAD_NAME, 'no stock name'));
    } else {
      this._stockName = String(rawStock.stockName).trim();
      this.convertStockNameToNumber();
    }

    // The DOB is expected to be an excel date serial number.
    // if it is not a number, we give it a try anyway, but flag a problem
    if (!this.rawStock.dob) {
      this.addProblem((new StockProblem(StockProblemType.MISSING_DOB)));
    } else if (typeof rawStock.dob === 'number') {
      this.dob = new Date(Date.UTC(0,0, rawStock.dob -1)).toISOString().substring(0, 10);
    } else {
      // if it's something else, give it a try anyway. But leave a breadcrumb

      const t = Date.parse(String(rawStock.dob));
      if (isNaN(t)) {
        this.dob = String(rawStock.dob);
        this.addProblem((new StockProblem(StockProblemType.DOB_UNDECIPHERABLE, `"${rawStock.dob}"`)));
      } else {
        this.dob = new Date(t).toISOString().substring(0,10);
        this.addProblem((new StockProblem(StockProblemType.DOB_NOT_A_DATE, `"${rawStock.dob}"`)));
      }
    }

    // if they have values, mom and dad should be valid stock numbers (if they are internal stocks)
    if (rawStock.mom) {
      this.internalMom = String(rawStock.mom);
    }
    if (this.internalMom && !Stock.isStockNameValid(this.internalMom)) {
      this.addProblem(new StockProblem(StockProblemType.INVALID_MOM));
    }
    if (rawStock.dad) {
      this.internalDad = String(rawStock.dad);
    }
    if (this.internalDad && !Stock.isStockNameValid(this.internalDad)) {
      this.addProblem(new StockProblem(StockProblemType.INVALID_DAD));
    }

    // Nursery counts have to be numbers
    if (rawStock.countEnteringNursery) {
      const count = Number(rawStock.countEnteringNursery);
      if (isNaN(count)) {
        this.addProblem(new StockProblem(StockProblemType.INVALID_NURSERY_COUNT, rawStock.countEnteringNursery));
      } else
        this.countEnteringNursery = count;
    }
    if (rawStock.countLeavingNursery) {
      const count = Number(rawStock.countLeavingNursery);
      if (isNaN(count)) {
        this.addProblem(new StockProblem(StockProblemType.INVALID_NURSERY_COUNT, rawStock.countLeavingNursery));
      } else
        this.countLeavingNursery = count;
    }

    // No context-free validation can be done on these.
    if (rawStock.description) {
      this.rawGenetics = rawStock.description;
    }
    if (rawStock.comment) {
      this.comment = rawStock.comment;
    }
    if (rawStock.researcher) {
      this.researcher = rawStock.researcher;
    }
    if (rawStock.externalMom) {
      this.externalMom = rawStock.externalMom;
    }
    if (rawStock.externalDad) {
      this.externalDad = rawStock.externalDad;
    }
  }

  static isStockNameValid(putativeName: string): boolean {
    return stockNameRE.test(putativeName);
  }

  convertStockNameToNumber() {
    if (!this._stockName) {
      return;
    } else {
      const snTest = stockNameRE.exec(this._stockName);
      if (snTest) {
        this._stockNumber = Number(snTest[1]);
        if (snTest[2]) {
          this._subStockNumber = Number(snTest[2]);
          // Please look the other way for a moment, while I get out my klugdel.
          // A stock number like 1660.10, as unusual as it would be, looks
          // like a number and sure enough it gets converted to 1660.1 somewhere
          // along the line. So, we tack on a 0 for such cases;
          if (snTest[2].length === 1) {
            this._stockName = this.stockName + '0';
          }
        }
      } else {
        this.addProblem(new StockProblem(StockProblemType.BAD_NAME))
      }
    }
  }

  isSubstock(): boolean{
    return (!!this.subStockNumber);
  }

  checkName(name: string): boolean{
    return !!(this._stockName && this._stockName === name);
  }

  addProblem(problem: StockProblem) {
    this.problems.push(problem);
  }

  // If a stock has duplicates, we cannot patch it because patches are identified by stock name
  // and if there are duplicates, we do not know how to associate a different patch with each duplicate.
  // Bottom line here is that duplicates must be patched in the raw-stock spreadsheet.
  getDuplicates(): StockProblem | undefined {
    return this.problems.find((problem: StockProblem) => problem.issue === StockProblemType.DUPLICATE_STOCK_NAME);
  }

  hasBadName(): boolean {
    return !!(this.problems.find((problem: StockProblem) => problem.issue === StockProblemType.BAD_NAME));
  }

  hasBadDOB(): boolean {
    return !!(this.problems.find((problem: StockProblem) =>
      problem.issue === StockProblemType.DOB_NOT_A_DATE ||
      problem.issue === StockProblemType.DOB_UNDECIPHERABLE ||
      problem.issue === StockProblemType.MISSING_DOB ||
      problem.issue === StockProblemType.TIME_TRAVELER
    ));
  }

  hasBadMom(): boolean {
    return !!(this.problems.find((problem: StockProblem) =>
      problem.issue === StockProblemType.INVALID_MOM ||
      problem.issue === StockProblemType.NO_SUCH_MOM ||
      problem.issue === StockProblemType.SUBSTOCK_MOM_DIFFERENT_FROM_BASE_STOCK
    ));
  }

  hasBadDad(): boolean {
    return !!(this.problems.find((problem: StockProblem) =>
      problem.issue === StockProblemType.INVALID_DAD ||
      problem.issue === StockProblemType.NO_SUCH_DAD ||
      problem.issue === StockProblemType.SUBSTOCK_DAD_DIFFERENT_FROM_BASE_STOCK
    ));
  }

  hasNurseryCountError(): boolean {
    return !!(this.problems.find((problem: StockProblem) =>
      problem.issue === StockProblemType.INVALID_NURSERY_COUNT
    ));
  }

}
