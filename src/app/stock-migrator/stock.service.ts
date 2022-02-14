import {Injectable} from '@angular/core';
import {Stock, stockNameRE} from './stock';
import {AppStateService, WellKnownStates} from '../app-state.service';
import {HttpClient} from '@angular/common/http';
import * as XLSX from 'xlsx';
import {StockData} from './stock-data';

/**
 * Import a customer's raw stock data from an Excel worksheet.
 *
 * Then acts like a database type service answering questions
 * and so on.
 *
 * TODO let the user choose where the spreadsheet is.
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

const RAW_STOCKS_WORKBOOK = 'raw-stocks.xlsm';
const RAW_STOCKS_SHEET = 'raw-stocks';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  // The set of problems we run into loading data from the raw-stock
  // excel file.  These are not specific to any one stock, but more
  // about the problems with the book as a whole.
  loadingProblems: string[] = [];

  // The set of raw stocks
  stocks: Stock[] = [];

  get stockBeingPatched(): Stock | undefined {
    return this._stockBeingPatched;
  }
  patchingStock(value: Stock | undefined) {
    this._stockBeingPatched = value;
  }
  private _stockBeingPatched: Stock | undefined;

  constructor(
    private appState: AppStateService,
    private httpClient: HttpClient,
  ) {
    this.loadRawStocks();
  }

  findStock(stockName: string): Stock | undefined {
    return this.stocks.find((s: Stock) => {
      return s && s.checkName(stockName);
    })
  }

  // This will return more than one if there are duplicate stock names
  getStocksByName(stockName: string | undefined): Stock[] {
    // Note if the string is empty or undefined we return an empty list
    // *EVEN IF* there is a stock with an empty name in the stocks list.
    // There may be several stocks with no name in the stock list if the
    // raw data from the excel sheet is bad.
    if (!stockName) return [];
     return this.stocks.filter((stock) => stock.stockName.current === stockName);
  }

  getStockBefore(stock: Stock): Stock {
    if (stock.index === 0) {
      return this.stocks[this.stocks.length -1];
    } else {
      return this.stocks[stock.index - 1];
    }
  }

  getStockAfter(stock: Stock): Stock {
    if (stock.index === this.stocks.length - 1) {
      return this.stocks[0];
    } else {
      return this.stocks[stock.index + 1];
    }
  }

  getKids(stockName: string | undefined): Stock[] {
    if (!stockName) return [];
    return this.stocks.filter((stock: Stock) => (
      stock.internalMom.current === stockName || stock.internalDad.current === stockName
    ))
  }
  getStockByIndex(index: number): Stock | undefined {
    return this.stocks[index];
  }

  loadRawStocks() {
    this.stocks = [];
    this.httpClient.get(
      `assets/${this.appState.getState(WellKnownStates.FACILITY)}/${RAW_STOCKS_WORKBOOK}`,
      {responseType: 'blob'}
    ).subscribe((data: any) => {
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        const binaryString: string = e.target.result;
        const rawStocksWb: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary' });
        if (!rawStocksWb) {
          this.loadingProblems.push(`Could not read ${RAW_STOCKS_WORKBOOK} workbook.`);
          return;
        }

        const ws = rawStocksWb.Sheets[RAW_STOCKS_SHEET];
        if (!ws) {
          this.loadingProblems.push(`Could not find worksheet: ${RAW_STOCKS_SHEET}.`);
          return;
        }

        this.loadStocks(XLSX.utils.sheet_to_json(ws));
      }
      reader.readAsBinaryString(data);
    });
  }

  // When a stock is loaded from a raw stock, validation all the "per attribute"
  // validation is performed, but not the validation of relationships between stocks.
  // For example, it will note that "123.xyz" is not a valid stock number, but will not
  // know that the internalMom "23.46" does not exist.
  loadStocks(rawStocks: StockData[]) {
    let index = -1;
    for (let rawStock of rawStocks) {
      index++;

      // Do a little tidying up of each field
      if (rawStock.stockName) {
        rawStock.stockName = String(rawStock.stockName).trim();
        // Please look the other way for a moment while I get out my klugdel.
        // A stock number like 1660.10 (as unusual as it would be) looks
        // like a number and sure enough it gets converted to 1660.1 somewhere
        // along the line. So, we tack on a 0 for such cases;
        const snTest = stockNameRE.exec(rawStock.stockName);
        if (snTest && snTest[2] && snTest[2].length === 1) {
          rawStock.stockName = rawStock.stockName + '0';
        }
      } else {
        rawStock.stockName = '';
      }

      if (rawStock.dob) {
        rawStock.dob = String(rawStock.dob).trim();
      } else {
        rawStock.dob = '';
      }


      // In the worksheet, the first stock is on row 2, but the index in the array is 0;
      this.stocks[index] = new Stock(index + 2, rawStock);
    }
    // Once they are all loaded validate them.
    // (You cannot do it before that, or you won't be able to properly check things
    //  whether the stock has duplicates or like whether a parent exists or whether
    //  a child is older than a parent.)
    for (const stock of this.stocks) stock.validate(this);
  }


  filterByProblemArea(problemArea: string | null): Stock[] {
    let filteredList: Stock[] = [];
    switch (problemArea) {
      case null:
        filteredList = this.stocks;
        break;
      case ('allProblems'):
        filteredList = this.stocks.filter((s: Stock) => !s.isValid());
        break;
      case ('stockName'):
        filteredList = this.stocks.filter((s: Stock) => !s.stockName.isValid());
        break;
      case ('dob'):
        filteredList = this.stocks.filter((s: Stock) => !s.dob.isValid());
        break;
      case ('internalParent'):
        filteredList = this.stocks.filter((s: Stock) =>
          ( !s.internalMom.isValid() ||
            !s.internalDad.isValid()));
        break;
      case ('nurseryCount'):
        filteredList = this.stocks.filter((s: Stock) =>
          ( !s.countEnteringNursery.isValid() ||
            !s.countLeavingNursery.isValid()));
        break;
    }
    return filteredList;
  }


}
