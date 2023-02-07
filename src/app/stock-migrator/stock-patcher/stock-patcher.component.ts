import {Component, OnInit} from '@angular/core';
import {StockService} from '../stock.service';
import {FormControl, Validators} from '@angular/forms';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Stock, ValidateDobFC, ValidateParentFC, ValidateStockNameFC} from '../stock';
import {ZFTool} from '../../../helpers/zf-tool';

@Component({
  selector: 'app-stock-patcher',
  templateUrl: './stock-patcher.component.html',
})
export class StockPatcherComponent implements OnInit {
  // Form controls for the fields the user can patch
  stockNameFC: FormControl = new FormControl();
  dobFC: FormControl = new FormControl();
  momFC: FormControl = new FormControl();
  dadFC: FormControl = new FormControl();
  countEnteringNurseryFC: FormControl = new FormControl();
  countLeavingNurseryFC: FormControl = new FormControl();
  geneticsFC: FormControl = new FormControl();
  commentFC: FormControl = new FormControl();

  stock: Stock | undefined;
  moms: Stock[] = [];
  dads: Stock[] = [];
  kids: Stock[] = [];

  constructor(
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
    this.momFC = new FormControl(null, [ValidateParentFC(this.service, this.stock)]);
    this.dadFC = new FormControl(null, [ValidateParentFC(this.service, this.stock)]);
    this.countEnteringNurseryFC = new FormControl(null, [Validators.min(0)]);
    this.countLeavingNurseryFC = new FormControl(null, [Validators.min(0)]);
    this.geneticsFC = new FormControl();
    this.commentFC = new FormControl();

    //------------------------- Stock Name --------------------------
    this.stockNameFC.valueChanges.subscribe((value: any) => {
      this.stock?.stockName.update(value);
      this.stock?.stockName.setValidity(this.stockNameFC.valid);
      this.refreshKids();
      // When a stock number changes it could wreak havoc.  Anyone pointing
      // to the old stock number as parent becomes broken and anyone
      // pointing to the new stock number as a parent needs to be checked.
      // So, inefficiently, just revalidate all the stocks.
      this.service.validateAll();
    })
    this.stockNameFC.setValue(stock.stockName.current);
    if (!stock.stockName.isValid()) this.stockNameFC.updateValueAndValidity();

    // DOB and parents are connected because a stock cannot be
    // younger than its mom or older than its kids.  That's why when dob
    // changes, we recheck the validity of the parents.
    //------------------------- DOB --------------------------
    this.dobFC.valueChanges.subscribe((value: any) => {
      this.stock?.dob.update(value);
      this.stock?.dob.setValidity(this.dobFC.valid);
      if (this.dobFC.valid && this.momFC.value) {
        this.momFC.updateValueAndValidity();
      }
      if (this.dobFC.valid && this.dadFC.value) {
        this.dadFC.updateValueAndValidity();
      }
      // when a birthdate changes, it could mean the kids have become
      // older than their parents, so we need to revalidate them
      for (const kid of this.kids) {
        kid.validate();
      }
    })
    this.dobFC.setValue(stock.dob.current);

    //------------------------- Mom & Dad --------------------------
    this.momFC.valueChanges.subscribe((value: any) => {
      this.stock?.mom.update(value);
      this.stock?.mom.setValidity(this.momFC.valid);
      this.moms = this.service.getStocksByName(this.stock?.mom.current);
    })
    this.momFC.setValue(stock.mom.current);

    this.dadFC.valueChanges.subscribe((value: any) => {
      this.stock?.dad.update(value);
      this.stock?.dad.setValidity(this.dadFC.valid);
      this.dads = this.service.getStocksByName(this.stock?.dad.current);
    })
    this.dadFC.setValue(stock.dad.current);

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
  }

  refreshKids() {
    this.kids = this.service.getKids(this.stock?.stockName.current);
  }

  goToPrev() {
    if (this.stock) {
      const prevStock = this.service.getStockBefore(this.stock)
      if (prevStock) {
        this.router.navigate([ZFTool.STOCK_MIGRATOR.route + '/patch/' + prevStock.index]).then();
      }
    }
  }
  goToNext() {
    if (this.stock) {
      const nextStock = this.service.getStockAfter(this.stock)
      if (nextStock) {
        this.router.navigate([ZFTool.STOCK_MIGRATOR.route + '/patch/' + nextStock.index]).then();
      }
    }
  }
}

