// A Stock is a record of data about a stock that is tidied up
// The general idea is that this gets refined as we add more "corrections" for
// converting the raw stocks to stocks that are ready for import into a zsm system.


import {StockProblem, StockProblemFields, StockProblemType} from './stock-problem';

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
  problems: { [index: string]: StockProblem[] } = {};
  private _duplicates: number[] = [];

  constructor(
    private _row: number, // the row on the input spreadsheet that this stock was found on
    private rawStock?: any,
  ) {
    if (!rawStock) {
      return;
    }
    if (!rawStock.stockName) {
      this.addProblem(StockProblemFields.STOCK_NAME, new StockProblem(StockProblemType.INVALID, 'no stock name'));
    } else {
      this.stockName = String(rawStock.stockName).trim();
      if (Stock.validateStockName(this.stockName)) {
        this.computeStockNumber(this.stockName);
      } else {
        this.addProblem(StockProblemFields.STOCK_NAME, new StockProblem(StockProblemType.INVALID));
      }
    }

    // The DOB is expected to be an excel date serial number.
    // if it is not a number, we give it a try anyway, but flag a problem
    if (!this.rawStock.dob) {
      this.addProblem(StockProblemFields.DOB, (new StockProblem(StockProblemType.INVALID)));
    } else if (typeof rawStock.dob === 'number') {
      this.dob = new Date(Date.UTC(0,0, rawStock.dob -1)).toISOString().substring(0, 10);
    } else {
      // if the dob is not a number, give it a try anyway. But leave a breadcrumb
      const t = Date.parse(String(rawStock.dob));
      if (isNaN(t)) {
        this.dob = String(rawStock.dob);
        this.addProblem(StockProblemFields.DOB, (new StockProblem(StockProblemType.INVALID, `"${rawStock.dob}"`)));
      } else {
        this.dob = new Date(t).toISOString().substring(0,10);
        this.addProblem(StockProblemFields.DOB, (new StockProblem(StockProblemType.NOT_A_DATE, `"${rawStock.dob}"`)));
      }
    }

    // if they have values, mom and dad should be valid stock numbers (if they are internal stocks)
    if (rawStock.mom) {
      this.internalMom = String(rawStock.mom);
    }
    if (this.internalMom && !Stock.validateStockName(this.internalMom)) {
      this.addProblem(StockProblemFields.INTERNAL_MOM, new StockProblem(StockProblemType.INVALID));
    }
    if (rawStock.dad) {
      this.internalDad = String(rawStock.dad);
    }
    if (this.internalDad && !Stock.validateStockName(this.internalDad)) {
      this.addProblem(StockProblemFields.INTERNAL_DAD, new StockProblem(StockProblemType.INVALID));
    }

    // Nursery counts have to be numbers
    if (rawStock.countEnteringNursery) {
      const count = Number(rawStock.countEnteringNursery);
      if (isNaN(count)) {
        this.addProblem(StockProblemFields.COUNT_ENTERING_NURSERY, new StockProblem(StockProblemType.INVALID, rawStock.countEnteringNursery));
      } else
        this.countEnteringNursery = count;
    }
    if (rawStock.countLeavingNursery) {
      const count = Number(rawStock.countLeavingNursery);
      if (isNaN(count)) {
        this.addProblem(StockProblemFields.COUNT_LEAVING_NURSERY, new StockProblem(StockProblemType.INVALID, rawStock.countLeavingNursery));
      } else
        this.countLeavingNursery = count;
    }

    // No context-free validation can be done on these.
    if (rawStock.genetics) {
      this.rawGenetics = rawStock.genetics;
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

  computeStockNumber(stockName: string) {
    const snTest = stockNameRE.exec(stockName);
    if (snTest) {
      this._stockNumber = Number(snTest[1]);
      if (snTest[2]) {
        this._subStockNumber = Number(snTest[2]);
        // Please look the other way for a moment while I get out my klugdel.
        // A stock number like 1660.10 (as unusual as it would be) looks
        // like a number and sure enough it gets converted to 1660.1 somewhere
        // along the line. So, we tack on a 0 for such cases;
        if (snTest[2].length === 1) {
          this._stockName = this.stockName + '0';
        }
      }
    }
  }

  isSubstock(): boolean{
    return (!!this.subStockNumber);
  }

  checkName(name: string): boolean{
    return !!(this._stockName && this._stockName === name);
  }

  addProblem(field: string, problem: StockProblem) {
    if (!this.problems[field]) {
      this.problems[field] = [problem];
    } else {
      this.problems[field].push(problem);
    }
  }

  get duplicates(): number[] {
    return this._duplicates;
  }

  set duplicates(rowNumbers: number[]) {
    this._duplicates = rowNumbers;
    this.addProblem(StockProblemFields.STOCK_NAME, new StockProblem(StockProblemType.DUPLICATE, rowNumbers.join(", ")));
  }

  hasDuplicates(): boolean {
    return (this.duplicates.length > 0);
  }

  static validateStockName(putativeName: string): boolean {
    return stockNameRE.test(putativeName);
  }


}
