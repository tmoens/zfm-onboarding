// This is a collection of the problems associated with a stock

export enum StockProblemType {
  ALL = 'all stock problems',
  DOB_NOT_A_DATE = 'dob was not a serial number, conversion attempted from',
  DOB_UNDECIPHERABLE = 'dob undecipherable',
  MISSING_DOB = 'missing dob',
  BAD_NAME = 'bad stock number',
  DUPLICATE_STOCK_NAME = 'duplicate stock number',
  INVALID_MOM = 'invalid stock number for mom',
  INVALID_DAD = 'invalid stock number for dad',
  INVALID_NURSERY_COUNT = 'invalid nursery count',
  NO_SUCH_MOM = 'no such mom',
  NO_SUCH_DAD = 'no such dad',
  TIME_TRAVELER = 'time traveler',
  SUBSTOCK_DOB_DIFFERENT_FROM_BASE_STOCK = 'sub-stock DOB different than base stock',
  SUBSTOCK_MOM_DIFFERENT_FROM_BASE_STOCK = 'sub-stock mom different than base stock mom',
  SUBSTOCK_DAD_DIFFERENT_FROM_BASE_STOCK = 'sub-stock dad different than base stock dad',
}

export class StockProblem {
  get issue(): StockProblemType {
    return this._issue;
  }

  get details(): string | undefined {
    return this._details;
  }
  constructor(
    private _issue: StockProblemType,
    private _details?: string) {
  }

  toString() {
    let s = `${this._issue}`;
    if (this._details) {
      s = s.concat(`: ${this._details}`);
    }
    return s;
  }
}

