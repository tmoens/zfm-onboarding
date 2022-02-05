// This is a collection of the problems associated with a stock

export enum StockProblemType {
  INVALID = 'invalid value',
  NOT_A_DATE = 'not a serial number, converted from text',
  DUPLICATE = 'duplicate',
  DOES_NOT_EXIST = 'does not exist',
  TIME_TRAVELER = 'older than parent',
  SUBSTOCK_DIFFERENT_THAN_BASE_STOCK = 'sub-stock different than base stock',
}

// These are the fields we are tracking problems for
export enum StockProblemFields {
  STOCK_NAME = 'stockName',
  DOB = 'dob',
  INTERNAL_MOM = 'internalMom',
  INTERNAL_DAD = 'internalDad',
  COUNT_ENTERING_NURSERY = 'countEnteringNursery',
  COUNT_LEAVING_NURSERY = 'countLeavingNursery',
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

