// This is a collection of the problems associated with a stock

export enum ProblemType {
  INVALID = 'invalid value',
  MISSING = 'required value missing',
  DUPLICATE = 'duplicate',
  DOES_NOT_EXIST = 'does not exist',
  TIME_TRAVELER = 'older than parent',
  SUBSTOCK_DIFFERENT_THAN_BASE_STOCK = 'sub-stock different than base stock',
}


