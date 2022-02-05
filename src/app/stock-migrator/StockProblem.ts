// This is a collection of the problems associated with a stock

export enum StockProblemTypes {
  BAD_DOB_FORMAT = 'bad dob format',
  BAD_NAME_FORMAT = 'bad stock number format',
  DUPLICATE_STOCK_NAME = 'duplicate stock number',
  NO_SUCH_MOM = 'no such mom',
  NO_SUCH_DAD = 'no such dad',
  TIME_TRAVLER = 'stock is older than parent',
}

export class StockProblem {
  constructor(
    private issue: StockProblemTypes,
    private details?: string) {
  }

  toString() {
    let s = `Issue: ${this.issue}`;
    if (this.details) {
      s = s.concat(`: ${this.details}`);
    }
    return s;
  }
}

