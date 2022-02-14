import {Component, OnInit} from '@angular/core';
import {AppStateService} from '../../app-state.service';
import {StockService} from '../stock.service';
import {FormControl, Validators} from '@angular/forms';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Stock, ValidateDobFC, ValidateParentFC, ValidateStockNameFC} from '../stock';
import {ZFTool} from '../../../helpers/zf-tool';

@Component({
  selector: 'app-stock-patcher',
  templateUrl: './stock-patcher.component.html',
  styleUrls: ['./stock-patcher.component.scss']
})
export class StockPatcherComponent implements OnInit {
  // Form controls for the fields the user can patch
  stockNameFC: FormControl = new FormControl();
  dobFC: FormControl = new FormControl();
  internalMomFC: FormControl = new FormControl();
  internalDadFC: FormControl = new FormControl();
  externalMomFC: FormControl = new FormControl();
  externalDadFC: FormControl = new FormControl();
  countEnteringNurseryFC: FormControl = new FormControl();
  countLeavingNurseryFC: FormControl = new FormControl();
  geneticsFC: FormControl = new FormControl();
  commentFC: FormControl = new FormControl();

  stock: Stock | undefined;
  mom: Stock | undefined;
  dad: Stock | undefined;
  nextStock: Stock | undefined;
  prevStock: Stock | undefined;
  kids: Stock[] = [];

  constructor(
    public appState: AppStateService,
    public service: StockService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    // watch for changes to the paramMap (i.e. changes to the route)
    this.route.paramMap.subscribe((pm: ParamMap) => {
      const id = Number(pm.get('id'));
      if (isNaN(id)) return;
      const stock = this.service.getStockByIndex(id);
      if (stock) this.initialize(stock);
    });
  }

  initialize(stock: Stock)  {
    this.stock = stock;
    this.service.patchingStock(stock);
    this.stockNameFC = new FormControl(null, [Validators.required, ValidateStockNameFC(this.service, stock)]);
    this.dobFC = new FormControl(null, [Validators.required, ValidateDobFC()]);
    this.internalMomFC = new FormControl(null, [ValidateParentFC(this.service, this.stock)]);
    this.externalMomFC = new FormControl();
    this.internalDadFC = new FormControl(null, [ValidateParentFC(this.service, this.stock)]);
    this.externalDadFC = new FormControl();
    this.countEnteringNurseryFC = new FormControl(null, [Validators.min(0)]);
    this.countLeavingNurseryFC = new FormControl(null, [Validators.min(0)]);
    this.geneticsFC = new FormControl();
    this.commentFC = new FormControl();

    //------------------------- Stock Name --------------------------
    this.stockNameFC.valueChanges.subscribe((value: any) => {
      this.stock?.stockName.update(value);
      this.stock?.stockName.setValidity(this.stockNameFC.valid);
      this.kids = this.service.getKids(this.stock?.stockName.current);
    })
    this.stockNameFC.setValue(stock.stockName.current);
    if (!stock.stockName.isValid()) this.stockNameFC.updateValueAndValidity();

    // DOB and internal parents are connected because a stock cannot be
    // younger than its mom or older than its kids.  That's why when dob
    // changes, we recheck the validity of the internal parents.
    //------------------------- DOB --------------------------
    this.dobFC.valueChanges.subscribe((value: any) => {
      this.stock?.dob.update(value);
      this.stock?.dob.setValidity(this.dobFC.valid);
      if (this.dobFC.valid && this.internalMomFC.value) {
        this.internalMomFC.updateValueAndValidity();
      }
      if (this.dobFC.valid && this.internalDadFC.value) {
        this.internalDadFC.updateValueAndValidity();
      }
    })
    this.dobFC.setValue(stock.dob.current);

    //------------------------- internal Mom & Dad --------------------------
    this.internalMomFC.valueChanges.subscribe((value: any) => {
      this.stock?.internalMom.update(value);
      this.stock?.internalMom.setValidity(this.internalMomFC.valid);
      const candidates: Stock[] = this.service.getStocksByName(this.stock?.internalMom.current);
      if (candidates.length === 1) {
        this.mom = candidates[0];
      } else {
        this.mom = undefined;
      }
    })
    this.internalMomFC.setValue(stock.internalMom.current);

    this.internalDadFC.valueChanges.subscribe((value: any) => {
      this.stock?.internalDad.update(value);
      this.stock?.internalDad.setValidity(this.internalDadFC.valid);
      const candidates: Stock[] = this.service.getStocksByName(this.stock?.internalDad.current);
      if (candidates.length === 1) {
        this.dad = candidates[0];
      } else {
        this.dad = undefined;
      }
    })
    this.internalDadFC.setValue(stock.internalDad.current);

    //------------------------- external Mom & Dad --------------------------
    this.externalMomFC.valueChanges.subscribe((value: any) => {
      this.stock?.externalMom.update(value);
    })
    this.externalMomFC.setValue(stock.externalMom.current);

    this.externalDadFC.valueChanges.subscribe((value: any) => {
      this.stock?.externalDad.update(value);
    })
    this.externalDadFC.setValue(stock.externalDad.current);

    //------------------------- Nursery Counts --------------------------
    this.countEnteringNurseryFC.valueChanges.subscribe((value: any) => {
      this.stock?.countEnteringNursery.update(String(value));
      this.stock?.countEnteringNursery.setValidity(this.countEnteringNurseryFC.valid);
    })
    this.countEnteringNurseryFC.setValue(stock.countEnteringNursery.current);

    this.countLeavingNurseryFC.valueChanges.subscribe((value: any) => {
      this.stock?.countLeavingNursery.update(String(value));
      this.stock?.countLeavingNursery.setValidity(this.countLeavingNurseryFC.valid);
    })
    this.countLeavingNurseryFC.setValue(stock.countLeavingNursery.current);

    //------------------------- Genetics & Comment --------------------------
    this.geneticsFC.valueChanges.subscribe((value: any) => {
      this.stock?.genetics.update(String(value));
    })
    this.geneticsFC.setValue(stock.genetics.current);

    this.commentFC.valueChanges.subscribe((value: any) => {
      this.stock?.comment.update(String(value));
    })
    this.commentFC.setValue(stock.comment.current);

    this.nextStock = this.service.getStockAfter(this.stock);
    this.prevStock = this.service.getStockBefore(this.stock)
  }

  goToPrev() {
    if (this.prevStock) {
      this.router.navigate([ZFTool.STOCK_MIGRATOR.route + '/patch/' + this.prevStock.index]).then();
    }
  }
  goToNext() {
    if (this.nextStock) {
      this.router.navigate([ZFTool.STOCK_MIGRATOR.route + '/patch/' + this.nextStock.index]).then();
    }
  }
}

