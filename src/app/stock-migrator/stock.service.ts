import {Injectable} from '@angular/core';
import {Stock, stockNameRE} from './stock';
import {AppStateService, WellKnownStates} from '../app-state.service';
import * as XLSX from 'xlsx';
import {StockJson} from './stock-json';
import {interval} from 'rxjs';
import {StockPatch} from './stock-patch';
import {WorkBook} from 'xlsx';

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

const WORKSHEET_NAME = 'raw-stocks';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  // The set of problems we run into loading data from the raw-stock
  // Excel file.  These are not specific to any one stock, but more
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
  ) {
  }

  // This will return more than one if there are duplicate stock names
  getStocksByName(stockName: string | undefined): Stock[] {
    // Note if the string is empty or undefined we return an empty list
    // *EVEN IF* there is a stock with an empty name in the stocks list.
    // There may be several stocks with no name in the stock list if the
    // raw data from the Excel sheet is bad.
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
      stock.mom.current === stockName || stock.dad.current === stockName
    ))
  }
  getStockByIndex(index: number): Stock | undefined {
    return this.stocks[index];
  }


  loadWorksheet(wb: XLSX.WorkBook) {
    this.stocks = [];

    const ws = wb.Sheets[WORKSHEET_NAME];
    if (!ws) {
      this.loadingProblems.push(`Could not find worksheet: ${WORKSHEET_NAME}.`);
      return;
    }

    this.loadStocks(XLSX.utils.sheet_to_json(ws));
  }

  // When a stock is loaded from a raw stock, validation all the "per attribute"
  // validation is performed, but not the validation of relationships between stocks.
  // For example, it will note that "123.xyz" is not a valid stock number, but will not
  // know that the mom "23.46" does not exist.
  loadStocks(rawStocks: StockJson[]) {
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

    // Reapply any changes that were in progress.
    // Load them up from local storage. They are just serialized stocks. We call them patches.
    const previouslyStoredPatches: {[index: string]: StockPatch} = this.loadChangesFromLocalStorage();
    // Loop through the stocks we loaded from the worksheet.
    for (const stock of this.stocks) {
      // See if there is/are patches matching on the unpatched stock name.
      // NOTE If there ar duplicates in the stock list and a matching patch,
      // then the patch will be applied to all the duplicate stocks.
      // The moral of the story - FIX DUPLICATES FIRST.  Thank you for your attention.
      stock.applyPatch(previouslyStoredPatches[stock.stockName.original]);
    }


    // Once they are all loaded validate them.
    // (You cannot do it before that, or you won't be able to properly check things
    //  whether the stock has duplicates or like whether a parent exists or whether
    //  a child is older than a parent.)
    this.validateStocks();

    // Now start a loop to save any patches to memory every few seconds
    interval(10000).subscribe(_ => this.saveChangesToLocalStorage())
  }

  validateStocks() {
    for (const stock of this.stocks) stock.validate(this);
  }

  filterByProblemArea(problemArea: string | null): Stock[] {
    let filteredList: Stock[] = [];
    switch (problemArea) {
      case ('allStocks'):
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
      case ('parent'):
        filteredList = this.stocks.filter((s: Stock) =>
          ( !s.mom.isValid() ||
            !s.dad.isValid()));
        break;
      case ('duplicates'):
        filteredList = this.stocks.filter((s: Stock) =>
          ( s.hasDuplicates() ));
        break;
    }
    return filteredList;
  }

  saveChangesToLocalStorage(): void {

    const stockPatches: {[index: string]: StockPatch} = {};
    // NOTE if there are stocks with duplicate names, only the patch for the
    // last one in the list will be saved.
    // The moral of the story - FIX DUPLICATES FIRST.  Thank you for your attention.
    for (const s of this.stocks) {
      const sp: StockPatch | null = s.extractPatch();
      if (sp) stockPatches[s.stockName.original] = sp;
    }
    this.appState.setState(WellKnownStates.STORED_STOCK_PATCHES, stockPatches, true);
  }

  loadChangesFromLocalStorage(): {[index: string]: StockPatch} {
    return this.appState.getState(WellKnownStates.STORED_STOCK_PATCHES);
  }

  exportWorksheet(wb: XLSX.WorkBook) {
    const data: StockJson[] = [];
    for (const s of this.stocks) {
      data.push(s.extractJsonForExcel());
    }
    wb.SheetNames.push(WORKSHEET_NAME);
    wb.Sheets[WORKSHEET_NAME] = XLSX.utils.json_to_sheet(data);
  }
}
