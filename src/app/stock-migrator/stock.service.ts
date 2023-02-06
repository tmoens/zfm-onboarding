import {Injectable} from '@angular/core';
import {Stock, stockNameRE} from './stock';
import {WellKnownStates} from '../app-state.service';
import {StockJson} from './stock-json';
import {BehaviorSubject, interval} from 'rxjs';
import {StockPatch} from './stock-patch';
import {GenericService} from '../generics/generic-service';
import {UniqueStringsAndTokens} from '../string-mauling/string-set/unique-strings'
import * as XLSX from 'xlsx';

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

@Injectable({
  providedIn: 'root'
})
export class StockService extends GenericService<Stock, StockJson> {

  userStrings: BehaviorSubject<UniqueStringsAndTokens> = new BehaviorSubject<UniqueStringsAndTokens>(new UniqueStringsAndTokens());
  geneticsStrings: BehaviorSubject<UniqueStringsAndTokens> = new BehaviorSubject<UniqueStringsAndTokens>(new UniqueStringsAndTokens());

  private _stockBeingPatched: Stock | undefined;

  get stockBeingPatched(): Stock | undefined {
    return this._stockBeingPatched;
  }
  patchingStock(value: Stock | undefined) {
    this._stockBeingPatched = value;
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
  override loadItems(rawStocks: StockJson[]) {
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
      const newStock = new Stock();
      newStock.row = index +2;
      newStock.datafillFromJson(rawStock);
      this.list[index] = newStock;
    }

    // Reapply any changes that were in progress.
    // Load them up from local storage. They are just serialized stocks. We call them patches.
    const previouslyStoredPatches: {[index: string]: StockPatch} = this.loadChangesFromLocalStorage();
    // Loop through the stocks we loaded from the worksheet.
    for (const stock of this.list) {
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

    this.refreshStringsAndTokens();

    // Now start a loop to save any patches to memory every minute
    interval(60000).subscribe(_ => this.saveChangesToLocalStorage())
  }

  validateStocks() {
    for (const stock of this.list) stock.validate(this);
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

  saveChangesToLocalStorage(): void {

    const stockPatches: {[index: string]: StockPatch} = {};
    // NOTE if there are stocks with duplicate names, only the patch for the
    // last one in the list will be saved.
    // The moral of the story - FIX DUPLICATES FIRST.  Thank you for your attention.
    for (const s of this.list) {
      const sp: StockPatch | null = s.extractPatch();
      if (sp) stockPatches[s.stockName.original] = sp;
    }
    this.appState.setState(WellKnownStates.STORED_STOCK_PATCHES, stockPatches, true);
  }

  override exportWorksheet(wb: XLSX.WorkBook, worksheetName: string) {
    const data: StockJson[] = [];
    for (const s of this.list) {
      const json: StockJson | null = s.extractJsonForExcel();
      if (json) data.push(json);
    }
    wb.SheetNames.push(worksheetName);
    wb.Sheets[worksheetName] = XLSX.utils.json_to_sheet(data);
  }

  loadChangesFromLocalStorage(): {[index: string]: StockPatch} {
    return this.appState.getState(WellKnownStates.STORED_STOCK_PATCHES);
  }


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
}
