import {Injectable} from '@angular/core';
import {Stock} from './stock';
import {BehaviorSubject} from 'rxjs';
import {GenericService} from '../generics/generic-service';
import {UniqueStringsAndTokens} from '../string-mauling/string-set/unique-strings'
import {JsonForExcel} from '../generics/json-for-excel';
import {PatternMapper} from '../string-mauling/pattern-mapper/pattern-mapper';
import {UserService} from '../user-migrator/user.service';
import {AppStateService} from '../app-state.service';
import {WorkBook} from 'xlsx';
import * as XLSX from 'xlsx';
import {TgService} from '../tg-migrator/tg.service';
import {Tg} from '../tg-migrator/tg';
import {Mutation} from '../mutation-migrator/mutation';
import {User} from '../user-migrator/user';
import {MutationService} from '../mutation-migrator/mutation.service';

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
  _tgPatternMappers: PatternMapper<Tg>[] = [];
  _mutationPatternMappers: PatternMapper<Mutation>[] = [];
  _userPatternMappers: PatternMapper<User>[] = [];
  geneticsStrings: BehaviorSubject<UniqueStringsAndTokens> = new BehaviorSubject<UniqueStringsAndTokens>(new UniqueStringsAndTokens());
  // After applying transgene and mutation pattern mappers to the genetics strings,
  // you get the residual genetics strings - the ones that still need taking care of.
  residualGeneticsStrings: BehaviorSubject<UniqueStringsAndTokens> = new BehaviorSubject<UniqueStringsAndTokens>(new UniqueStringsAndTokens());
  userStrings: BehaviorSubject<UniqueStringsAndTokens> = new BehaviorSubject<UniqueStringsAndTokens>(new UniqueStringsAndTokens());
  residualUserStrings: BehaviorSubject<UniqueStringsAndTokens> = new BehaviorSubject<UniqueStringsAndTokens>(new UniqueStringsAndTokens());

  constructor(
    private appService: AppStateService,
    private userService: UserService,
    private tgService: TgService,
    private mutationService: MutationService,
  ) {
    super(appService);
    userService.patternMappers.subscribe((patternMappers: PatternMapper<User>[]) => {
      this._userPatternMappers = patternMappers;
      this.applyUserPatternMappers();
    })
    tgService.patternMappers.subscribe((patternMappers: PatternMapper<Tg>[]) => {
      this._tgPatternMappers = patternMappers;
      this.applyGeneticsPatternMappers();
    })
    mutationService.patternMappers.subscribe((patternMappers: PatternMapper<Mutation>[]) => {
      this._mutationPatternMappers = patternMappers;
      this.applyGeneticsPatternMappers();
    })
  }


  // This will return more than one if there are duplicate stock names
  getStocksByName(stockName: string | undefined): Stock[] {
    // Note if the string is empty or undefined we return an empty list
    // *EVEN IF* there is a stock with an empty name in the stocks list.
    // There may be several stocks with no name in the stock list if the
    // raw data from the Excel sheet is bad.
    if (!stockName) return [];
    return this._list.filter((stock) => stock.stockName.current === stockName);
  }

  getStockBefore(stock: Stock): Stock {
    if (stock.index === 0) {
      return this._list[this._list.length -1];
    } else {
      return this._list[stock.index - 1];
    }
  }

  getStockAfter(stock: Stock): Stock {
    if (stock.index === this._list.length - 1) {
      return this._list[0];
    } else {
      return this._list[stock.index + 1];
    }
  }

  getKids(stockName: string | undefined): Stock[] {
    if (!stockName) return [];
    return this._list.filter((stock: Stock) => (
      stock.mom.current === stockName || stock.dad.current === stockName
    ))
  }

  // When a stock is loaded from a raw stock, validation all the "per attribute"
  // validation is performed, but not the validation of relationships between stocks.
  // For example, it will note that "123.xyz" is not a valid stock number, but will not
  // know that the mom "23.46" does not exist.
  override loadJsonItems(rawStocks: JsonForExcel[]) {
    let row = 2; // The first stock is on row 2 of the worksheet.
    for (let rawStock of rawStocks) {
      const newStock = new Stock(this);
      newStock.row = row;
      row++;
      newStock.datafillFromJson(rawStock);
      // Icky - while loading items we do not use the "add" method because that triggers
      // re-sorting, re-filtering and re-exporting data.
      this._list.push(newStock);
    }
  }

  override filterList() {
    if (this._regExpFilter) {
      this._filteredList = this._list.filter((stock: Stock) => {
        return (this._regExpFilter?.test(stock.stockName.current) ||
          this._regExpFilter?.test(stock.genetics.current) ||
          this._regExpFilter?.test(stock.comment.current));
      })
    }
    this.filteredList.next(this._filteredList);
  }

  filterByProblemArea(problemArea: string | null): Stock[] {
    let filteredList: Stock[] = [];
    switch (problemArea) {
      case ('allStocks'):
        filteredList = this._list;
        break;
      case ('allProblems'):
        filteredList = this._list.filter((s: Stock) => !s.isValid());
        break;
      case ('stockName'):
        filteredList = this._list.filter((s: Stock) => !s.stockName.isValid());
        break;
      case ('dob'):
        filteredList = this._list.filter((s: Stock) => !s.dob.isValid());
        break;
      case ('parent'):
        filteredList = this._list.filter((s: Stock) =>
          ( !s.mom.isValid() ||
            !s.dad.isValid()));
        break;
      case ('duplicates'):
        filteredList = this._list.filter((s: Stock) =>
          ( s.hasDuplicates() ));
        break;
    }
    return filteredList;
  }



  override afterLoadingFromWorkbook() {
    this.refreshStringsAndTokens();

    // Once they are all loaded and patched, validate them.
    // (You cannot do it before that, or you won't be able to properly check things
    // whether the stock has duplicates or like whether a parent exists or whether
    // a child is older than a parent.)
    this.validateAll();

    // Once loaded and patched and validated, we start watching for changes.
    this.geneticsStrings.subscribe(_ => {
      this.applyGeneticsPatternMappers();
    })
    this.userStrings.subscribe(_ => {
      this.applyUserPatternMappers();
    })

  }

  validateAll() {
    this._list.map((s: Stock) => s.validate());
  }

  /**
   * Itemize and tokenize the input strings that represent the genetics for each stock
   * and the researchers (users) associated with each stock.
   */
  refreshStringsAndTokens() {
    const userSandT = new UniqueStringsAndTokens('Original');
    const geneticsSandT = new UniqueStringsAndTokens('Original');
    this._list.map((s: Stock) => {
      userSandT.addString(s.researcher.current);
      geneticsSandT.addString(s.genetics.current);
    });
    this.userStrings.next(userSandT);
    this.geneticsStrings.next(geneticsSandT);
  }


  /**
   * Take all the "genetics" strings that describe a stock and use the mutation
   * and transgene pattern mappers to map the strings to specific transgenes and mutations.
   * At the same time compute what is left of the original strings once the transgene
   * and mutation patterns have been removed.
   *
   * Note - this happens a lot.  Whenever a new pattern mapper is made or when they change order
   * or when the "original" genetics strings get changed by the user.
   */
  applyGeneticsPatternMappers() {
    const originalStrings: UniqueStringsAndTokens = this.geneticsStrings.value;
    const residualStrings = new UniqueStringsAndTokens('Residual');
    for (const s of Object.keys(originalStrings.strings)) {
      let residual: string = s;
      // do transgene patterns first as some mutation patterns can occur within a transgene.
      for (const pm of this._tgPatternMappers) {
        residual = pm.removedMatchedBitsFromString(residual);
      }
      for (const pm of this._mutationPatternMappers) {
        residual = pm.removedMatchedBitsFromString(residual);
      }
      residualStrings.addString(residual, originalStrings.strings[s]);
    }
    this.residualGeneticsStrings.next(residualStrings);
  }
  applyUserPatternMappers() {
    const originalStrings: UniqueStringsAndTokens = this.userStrings.value;
    const residualStrings = new UniqueStringsAndTokens('Residual');
    for (const s of Object.keys(originalStrings.strings)) {
      let residual: string = s;
      // do transgene patterns first as some mutation patterns can occur within a transgene.
      for (const pm of this._userPatternMappers) {
        residual = pm.removedMatchedBitsFromString(residual);
      }
      residualStrings.addString(residual, originalStrings.strings[s]);
    }
    this.residualUserStrings.next(residualStrings);
  }

  override exportWorksheet(wb: WorkBook) {
    // in addition to exporting the patched raw-stock sheet we export other sheets
    // For the import tool:
    // - "stocks" bare bones of each stock plus the researcher and pi usernames
    // - "lineage" parents of each stock
    // - "markers" mutations and transgenes for each stock
    super.exportWorksheet(wb);
    const stockImportDtos: JsonForExcel[] = [];
    const stockLineageDtos: JsonForExcel[] = [];
    const stockMarkerDtos: JsonForExcel[] = [];

    this._list.map((stock: Stock) => {
      const stockImportDto: JsonForExcel = {
        name: stock.stockName.current,
        description: stock.genetics.current,
        comment: stock.comment.current,
        fertilizationDate: stock.dob.current,
        countEnteringNursery: stock.countEnteringNursery.current,
        countLeavingNursery: stock.countLeavingNursery.current,
        researcherUsername: stock.researcherUsername.current,
        piUsername: stock.piUsername.current,
      }
      stockImportDtos.push(stockImportDto);
      const stockLineageDto: JsonForExcel = {
        stockNumber: stock.stockName.current,
        internalMom: stock.mom?.current,
        internalDad: stock.dad?.current,
        externalMomName: '',
        externalMomDescription: '',
        externalDadName: '',
        externalDadDescription: '',
      }
      stockLineageDtos.push(stockLineageDto);
      const stockMarkerDto: JsonForExcel = {
        stockNumber: stock.stockName.current,
        alleles: stock.applyGeneticsPatternMappers(this._tgPatternMappers, this._mutationPatternMappers),
      }
      stockMarkerDtos.push(stockMarkerDto);
    })
    wb.SheetNames.push('stocks');
    wb.Sheets['stocks'] = XLSX.utils.json_to_sheet(stockImportDtos);
    wb.SheetNames.push('lineage');
    wb.Sheets['lineage'] = XLSX.utils.json_to_sheet(stockLineageDtos);
    wb.SheetNames.push('markers');
    wb.Sheets['markers'] = XLSX.utils.json_to_sheet(stockMarkerDtos);
  }
}
