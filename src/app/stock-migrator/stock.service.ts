import {Injectable} from '@angular/core';
import {Stock, stockNameRE} from './stock';
import {AppStateService, WellKnownStates} from '../app-state.service';
import {HttpClient} from '@angular/common/http';
import * as XLSX from 'xlsx';
import {StockData} from './stock-data';
import {ProblemType} from './stock-problems';

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
  getStocksByName(stockName: string): Stock[] {
     return this.stocks.filter((stock) => stock.stockName.best === stockName);
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
        this.checkForDuplicates();
        this.checkLineage();
        this.checkSubstocks();
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
  }

  // cycle through the raw stocks and note any that have duplicate names.
  checkForDuplicates() {
    this.stocks.forEach((stock: Stock) => {
      const dups: Stock[] = this.getStocksByName(stock.stockName.best);
      if (dups.length > 1) {
        stock.stockName.addProblem(ProblemType.DUPLICATE);
      }
    })
  }

  // if present, mom and dad should exist
  // mom and dad should be older than the stock
  checkLineage() {
    // this.stocks.forEach((stock: Stock) => {
    //   const mom = stock.attrs[AttrNames.INTERNAL_MOM];
    //   if (mom.current) {
    //     const parent: Stock | undefined = this.findStock(mom.current);
    //     if (parent) {
    //       if (stock.currentStock.dob && parent.currentStock.dob && stock.currentStock.dob <= parent.currentStock.dob) {
    //         stock.addProblem(StockAttrs.INTERNAL_MOM, ProblemType.TIME_TRAVELER);
    //         stock.addProblem(StockAttrs.DOB, ProblemType.TIME_TRAVELER);
    //       }
    //     } else {
    //       stock.addProblem(StockAttrs.INTERNAL_MOM, ProblemType.DOES_NOT_EXIST);
    //     }
    //   }
    //   if (stock.currentStock.internalDad) {
    //     const parent: Stock | undefined = this.findStock(stock.currentStock.internalDad);
    //     if (parent) {
    //       if (stock.currentStock.dob && parent.currentStock.dob && stock.currentStock.dob <= parent.currentStock.dob) {
    //         stock.addProblem(StockAttrs.INTERNAL_DAD, ProblemType.TIME_TRAVELER);
    //         stock.addProblem(StockAttrs.DOB, ProblemType.TIME_TRAVELER);
    //       }
    //     } else {
    //       stock.addProblem(StockAttrs.INTERNAL_DAD,ProblemType.DOES_NOT_EXIST);
    //     }
    //   }
    // });
  }


  // if the stock is a sub-stock, it should have the same parents and dob as the base stock
  checkSubstocks() {
    // this.stocks.forEach((stock: Stock) => {
    //   if (stock.isSubstock()) {
    //     const baseStock: Stock | undefined = this.findStock(String(stock.stockNumber));
    //     if (baseStock && stock.currentStock.internalMom !== baseStock.currentStock.internalMom) {
    //       stock.addProblem(StockAttrs.INTERNAL_MOM, ProblemType.SUBSTOCK_DIFFERENT_THAN_BASE_STOCK)
    //     }
    //     if (baseStock && stock.currentStock.internalDad !== baseStock.currentStock.internalDad) {
    //       stock.addProblem(StockAttrs.INTERNAL_DAD, ProblemType.SUBSTOCK_DIFFERENT_THAN_BASE_STOCK)
    //     }
    //     if (baseStock && stock.currentStock.dob !== baseStock.currentStock.dob) {
    //       stock.addProblem(StockAttrs.DOB, ProblemType.SUBSTOCK_DIFFERENT_THAN_BASE_STOCK)
    //     }
    //   }
    // });
  }
  filterByProblemArea(problemArea: string | null, unPatchedProblemsOnly: boolean = true): Stock[] {
    let filteredList: Stock[] = [];
    switch (problemArea) {
      case null:
        filteredList = this.stocks;
        break;
      case ('allProblems'):
        filteredList = this.stocks.filter((s: Stock) => s.hasProblems(unPatchedProblemsOnly));
        break;
      case ('stockName'):
        filteredList = this.stocks.filter((s: Stock) => s.stockName.hasProblems(unPatchedProblemsOnly));
        break;
      case ('dob'):
        filteredList = this.stocks.filter((s: Stock) => s.dob.hasProblems(unPatchedProblemsOnly));
        break;
      case ('internalParent'):
        filteredList = this.stocks.filter((s: Stock) =>
          ( s.internalMom.hasProblems(unPatchedProblemsOnly) ||
            s.internalMom.hasProblems(unPatchedProblemsOnly)));
        break;
      case ('nurseryCount'):
        filteredList = this.stocks.filter((s: Stock) =>
          ( s.countEnteringNursery.hasProblems(unPatchedProblemsOnly) ||
            s.countLeavingNursery.hasProblems(unPatchedProblemsOnly)));
        break;
    }
    return filteredList;
  }


}
