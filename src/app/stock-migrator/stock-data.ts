// A Stock is a record of data about a stock that is tidied up
// The general idea is that this gets refined as we add more "corrections" for
// converting the raw stocks to stocks that are ready for import into a zsm system.

export enum StockAttrs {
  STOCK_NAME = 'stockName',
  DOB = 'dob',
  COUNT_ENTERING_NURSERY = 'countEnteringNursery',
  COUNT_LEAVING_NURSERY = 'countLeavingNursery',
  INTERNAL_MOM = 'internalMom',
  INTERNAL_DAD = 'internalDad',
  EXTERNAL_MOM = 'externalMom',
  RESEARCHER = 'researcher',
  GENETICS = 'genetics',
  COMMENT = 'comment',
}

export class StockData {
  stockName: string = '';
  dob: string = '';
  countEnteringNursery: string = '';
  countLeavingNursery: string = '';
  researcher: string = '';
  internalMom: string = '';
  internalDad: string = '';
  externalMom: string = '';
  externalDad: string = '';
  genetics: string = '';
  comment: string = '';

  constructor() {};
}
