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

  serviceName = 'stock';
  override get worksheetName(): string {
    return 'raw-stocks';
  }
  _tgPatternMappers: PatternMapper<Tg>[] = [];
  _mutationPatternMappers: PatternMapper<Mutation>[] = [];
  _researcherPatternMappers: PatternMapper<User>[] = [];
  _piPatternMappers: PatternMapper<User>[] = [];
  geneticsStrings: BehaviorSubject<UniqueStringsAndTokens> =
    new BehaviorSubject<UniqueStringsAndTokens>(new UniqueStringsAndTokens());
  // After applying transgene and mutation pattern mappers to the genetics strings,
  // you get the residual genetics strings - the ones that still need taking care of.
  residualGeneticsStrings: BehaviorSubject<UniqueStringsAndTokens> =
    new BehaviorSubject<UniqueStringsAndTokens>(new UniqueStringsAndTokens());
  researcherStrings: BehaviorSubject<UniqueStringsAndTokens> =
    new BehaviorSubject<UniqueStringsAndTokens>(new UniqueStringsAndTokens());
  residualResearcherStrings: BehaviorSubject<UniqueStringsAndTokens> =
    new BehaviorSubject<UniqueStringsAndTokens>(new UniqueStringsAndTokens());
  piStrings: BehaviorSubject<UniqueStringsAndTokens> =
    new BehaviorSubject<UniqueStringsAndTokens>(new UniqueStringsAndTokens());
  residualPiStrings: BehaviorSubject<UniqueStringsAndTokens> =
    new BehaviorSubject<UniqueStringsAndTokens>(new UniqueStringsAndTokens());

  _userFilter: RegExp = /.*/;
  set userFilterString(regExpString: string) {
    try {
      this._userFilter = new RegExp(regExpString, 'i');
    } catch {
      console.log('Oopsy, this should not happen.');
    }
    this.appState.setState('userRegExpFilterString', regExpString, true);
    this.researcherStrings.value.setFilter(this._userFilter);
    this.residualResearcherStrings.value.setFilter(this._userFilter);
    this.piStrings.value.setFilter(this._userFilter);
    this.residualPiStrings.value.setFilter(this._userFilter);
    this.applyResearcherPatternMappers();
    this.applyPiPatternMappers();
  }
  get userFilterString(): string {
    const regExpString = this.appState.getState('userRegExpFilterString');
    if (regExpString) {
      return regExpString;
    } else {
      return '.*';
    }
  }
  _geneticsFilter: RegExp = /.*/;
  set geneticsFilterString(regExpString: string) {
    try {
      this._geneticsFilter = new RegExp(regExpString, 'i');
    } catch {
      console.log('Oopsy, this should not happen.');
    }
    this.appState.setState('geneticsRegExpFilterString', regExpString, true);
    this.geneticsStrings.value.setFilter(this._geneticsFilter);
    this.residualGeneticsStrings.value.setFilter(this._geneticsFilter);
    this.applyGeneticsPatternMappers();
  }
  _piFilterForGenetics: RegExp = /.*/;
  set piFilterForGenetics(regExpString: string) {
    try {
      this._piFilterForGenetics = new RegExp(regExpString, 'i');
    } catch {
      console.log('Oopsy, this should not happen.');
    }
    this.refreshStringsAndTokens();
  }

  constructor(
    private appService: AppStateService,
    private researcherService: UserService,
    private tgService: TgService,
    private mutationService: MutationService,
  ) {
    super(appService);
    researcherService.patternMappers.subscribe((patternMappers: PatternMapper<User>[]) => {
      this._researcherPatternMappers = patternMappers;
      this.applyResearcherPatternMappers();
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
          this._regExpFilter?.test(stock.migrationNotes.current) ||
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
    this.researcherStrings.subscribe(_ => {
      this.applyResearcherPatternMappers();
    })
    this.piStrings.subscribe(_ => {
      this.applyPiPatternMappers();
    })
    this.filterList();
  }

  validateAll() {
    this._list.map((s: Stock) => s.validate());
  }

  /**
   * Itemize and tokenize the input strings that represent the genetics for each stock
   * and the users associated with each stock.
   */
  refreshStringsAndTokens() {
    const researcherSandT = new UniqueStringsAndTokens('Original', true);
    researcherSandT.setFilter(this._userFilter);
    const piSandT = new UniqueStringsAndTokens('Original', true);
    piSandT.setFilter(this._userFilter);
    const geneticsSandT = new UniqueStringsAndTokens('Original');
    geneticsSandT.setFilter(this._geneticsFilter);
    this._list.map((s: Stock) => {
      researcherSandT.addString(s.researcher.current);
      piSandT.addString(s.researcher.current);
      // For a big lab there are too many genetics strings and tokens to
      // deal with, so we can filter down to only the genetics strings and
      // tokens for the stocks belonging to a single PI.  Note, this only
      // makes sense if the PIs of all the stocks are known.
      if (this._piFilterForGenetics.test(s.piUsername.current)) {
        geneticsSandT.addString(s.genetics.current);
      }
    });
    this.researcherStrings.next(researcherSandT);
    this.piStrings.next(piSandT);
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
    residualStrings.setFilter(this._geneticsFilter);
    this.residualGeneticsStrings.next(residualStrings);
  }
  applyResearcherPatternMappers() {
    const originalStrings: UniqueStringsAndTokens = this.researcherStrings.value;
    const residualStrings = new UniqueStringsAndTokens('Residual', true);
    for (const s of Object.keys(originalStrings.strings)) {
      let residual: string = s;
      for (const pm of this._researcherPatternMappers) {
        residual = pm.removedMatchedBitsFromString(residual);
      }
      residualStrings.addString(residual, originalStrings.strings[s]);
    }
    residualStrings.setFilter(this._userFilter);
    this.residualResearcherStrings.next(residualStrings);
  }
  applyPiPatternMappers() {
    const originalStrings: UniqueStringsAndTokens = this.researcherStrings.value;
    const residualStrings = new UniqueStringsAndTokens('Residual', true);
    for (const s of Object.keys(originalStrings.strings)) {
      let residual: string = s;
      for (const pm of this._piPatternMappers) {
        residual = pm.removedMatchedBitsFromString(residual);
      }
      residualStrings.addString(residual, originalStrings.strings[s]);
    }
    residualStrings.setFilter(this._userFilter);
    this.residualPiStrings.next(residualStrings);
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
      stock.applyUserPatternMappers(this._piPatternMappers, this._researcherPatternMappers);
      const migrationNotes: string[] = [];
      if (stock.researcher.original) {
        migrationNotes.push(`original owner: ${stock.researcher.original}`);
      }
      if (stock.migrationNotes.current) {
        migrationNotes.push(stock.migrationNotes.current);
      }

      const stockImportDto: JsonForExcel = {
        name: stock.stockName.current,
        description: stock.genetics.current,
        comment: (migrationNotes.length > 0) ? `${stock.comment.current} Migration notes: ${migrationNotes.join("; ")}` : stock.comment.current,
        fertilizationDate: stock.dob.current,
        countEnteringNursery: stock.countEnteringNursery.current,
        countLeavingNursery: stock.countLeavingNursery.current,
        researcherUsername: stock.researcherUsername.current,
        piUsername: stock.piUsername.current,
        userCrosscheck: stock.researcher.current,
      }
      stockImportDtos.push(stockImportDto);

      // export lineage only if the stock has a parent
      if (stock.mom?.current || stock.dad?.current) {
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
      }
      // likewise, only export markers if there are markers to export.
      const alleles: string = stock.applyGeneticsPatternMappers(this._tgPatternMappers, this._mutationPatternMappers);
      if (alleles) {
        const stockMarkerDto: JsonForExcel = {
          stockName: stock.stockName.current,
          alleles: alleles,
          alleleCrosscheck: stock.genetics.current,
        }
        stockMarkerDtos.push(stockMarkerDto);
      }
    })
    wb.SheetNames.push('stock');
    wb.Sheets['stock'] = XLSX.utils.json_to_sheet(stockImportDtos);
    wb.SheetNames.push('lineage');
    wb.Sheets['lineage'] = XLSX.utils.json_to_sheet(stockLineageDtos);
    wb.SheetNames.push('stock-markers');
    wb.Sheets['stock-markers'] = XLSX.utils.json_to_sheet(stockMarkerDtos);
  }
}
