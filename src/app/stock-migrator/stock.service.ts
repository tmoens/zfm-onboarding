import {Injectable} from '@angular/core';
import {Stock} from './stock';
import {BehaviorSubject} from 'rxjs';
import {GenericService} from '../generics/generic-service';
import {UniqueStringsAndTokens} from '../string-mauling/string-set/unique-strings'
import {JsonForExcel} from '../generics/json-for-excel';
import {PatternMapper} from '../string-mauling/pattern-mapper/pattern-mapper';
import {UserService} from '../user-migrator/user.service';
import {AppStateService} from '../app-state.service';

/**
 * Import a customer's raw stock data from an Excel worksheet.
 *
 * Then acts like a database type service answering questions and so on.
 *
 * We go looking for a sheet called "raw-stocks"
 * We make use of the following columns
 * stockName - typically a stock number like 2301 or 1472.03
 * dob - a string representation of the fertilization date of the stock
 * genetics -  string description of the stock's transgenes and mutations
 * mom - the stock number of the mom, have this is mom is from the facility
 * dad - like mom
 * researcher - the researcher who is working on the stock
 * countEnteringNursery - how many embryos entered the nursery
 * countLeavingNursery - how many embryos left the nursery
 * comment - an ad-hoc comment about the stock
 * **ALL OTHER COLUMNS ARE IGNORED** but there is no harm in having them
 */

@Injectable({
  providedIn: 'root'
})
export class StockService extends GenericService<Stock> {
  localPatternMapperStorageToken = 'stockPatternMappersNotUsed' // Not used but required by GenericService
  localPatchStorageToken = 'stockPatches'
  worksheetName = 'raw-stocks'
  userStrings: BehaviorSubject<UniqueStringsAndTokens> = new BehaviorSubject<UniqueStringsAndTokens>(new UniqueStringsAndTokens());
  geneticsStrings: BehaviorSubject<UniqueStringsAndTokens> = new BehaviorSubject<UniqueStringsAndTokens>(new UniqueStringsAndTokens());

  private _stockBeingPatched: Stock | undefined;

  get stockBeingPatched(): Stock | undefined {
    return this._stockBeingPatched;
  }
  patchingStock(value: Stock | undefined) {
    this._stockBeingPatched = value;
  }

  constructor(
    private appService: AppStateService,
    private userService: UserService,
  ) {
    super(appService);
    userService.patternMappers.subscribe((patternMappers: PatternMapper[]) => {
      this.applyUserPatternMappers(patternMappers);
    })
  }

  // This will return more than one if there are duplicate stock names
  getStocksByName(stockName: string | undefined): Stock[] {
    // Note if the string is empty or undefined we return an empty list
    // *EVEN IF* there is a stock with an empty name in the stocks list.
    // There may be several stocks with no name in the stock list if the
    // raw data from the Excel sheet is bad.
    if (!stockName) return [];
    return this.list.filter((stock) => stock.stockName.current === stockName);
  }

  getStockBefore(stock: Stock): Stock {
    if (stock.index === 0) {
      return this.list[this.list.length -1];
    } else {
      return this.list[stock.index - 1];
    }
  }

  getStockAfter(stock: Stock): Stock {
    if (stock.index === this.list.length - 1) {
      return this.list[0];
    } else {
      return this.list[stock.index + 1];
    }
  }

  getKids(stockName: string | undefined): Stock[] {
    if (!stockName) return [];
    return this.list.filter((stock: Stock) => (
      stock.mom.current === stockName || stock.dad.current === stockName
    ))
  }
  getStockByIndex(index: number): Stock | undefined {
    return this.list[index];
  }

  // When a stock is loaded from a raw stock, validation all the "per attribute"
  // validation is performed, but not the validation of relationships between stocks.
  // For example, it will note that "123.xyz" is not a valid stock number, but will not
  // know that the mom "23.46" does not exist.
  override loadItems(rawStocks: JsonForExcel[]) {
    let index = -1;
    for (let rawStock of rawStocks) {
      index++;

      // In the worksheet, the first stock is on row 2, but the index in the array is 0;
      const newStock = new Stock(this);
      newStock.row = index +2;
      newStock.datafillFromJson(rawStock);
      this.list[index] = newStock;
    }
  }

  filterByProblemArea(problemArea: string | null): Stock[] {
    let filteredList: Stock[] = [];
    switch (problemArea) {
      case ('allStocks'):
        filteredList = this.list;
        break;
      case ('allProblems'):
        filteredList = this.list.filter((s: Stock) => !s.isValid());
        break;
      case ('stockName'):
        filteredList = this.list.filter((s: Stock) => !s.stockName.isValid());
        break;
      case ('dob'):
        filteredList = this.list.filter((s: Stock) => !s.dob.isValid());
        break;
      case ('parent'):
        filteredList = this.list.filter((s: Stock) =>
          ( !s.mom.isValid() ||
            !s.dad.isValid()));
        break;
      case ('duplicates'):
        filteredList = this.list.filter((s: Stock) =>
          ( s.hasDuplicates() ));
        break;
    }
    return filteredList;
  }



  override afterLoadWorksheet() {
    this.refreshStringsAndTokens();

    // Once they are all loaded and patched, validate them.
    // (You cannot do it before that, or you won't be able to properly check things
    // whether the stock has duplicates or like whether a parent exists or whether
    // a child is older than a parent.)
    this.validateAll();
  }

  validateAll() {
    this.list.map((s: Stock) => s.validate());
  }

  /**
   * Itemize and tokenize the input strings that represent the genetics for each stock
   * and the researchers associated with each stock.
   */
  refreshStringsAndTokens() {
    const userSandT = new UniqueStringsAndTokens();
    const geneticsSandT = new UniqueStringsAndTokens();
    this.list.map((s: Stock) => {
      userSandT.addString(s.researcher.current);
      geneticsSandT.addString(s.genetics.current);
    });
    this.userStrings.next(userSandT);
    this.geneticsStrings.next(geneticsSandT);
  }

  applyUserPatternMappers(patternMappers: PatternMapper[] = []) {
    this.list.map((s:Stock) => {
      s.applyUserPatternMappers(patternMappers);
    })
  }
}
