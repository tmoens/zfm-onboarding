import {Component, Input, OnInit} from '@angular/core';
import {StockService} from '../stock.service';
import {FormControl, Validators} from '@angular/forms';
import {Stock, ValidateDobFC, ValidateParentFC, ValidateStockNameFC} from '../stock';

@Component({
  selector: 'app-stock-patcher',
  templateUrl: './stock-patcher.component.html',
})
export class StockPatcherComponent implements OnInit {

  @Input() set stock(stock: Stock | undefined) {
    if (stock) {
      this._stock = stock;
      this.initialize(stock);
    }
  }
  // Form controls for the fields the user can patch
  stockNameFC: FormControl = new FormControl();
  dobFC: FormControl = new FormControl();
  momFC: FormControl = new FormControl();
  dadFC: FormControl = new FormControl();
  countEnteringNurseryFC: FormControl = new FormControl();
  countLeavingNurseryFC: FormControl = new FormControl();
  researcherFC: FormControl = new FormControl();
  geneticsFC: FormControl = new FormControl();
  commentFC: FormControl = new FormControl();

  _stock: Stock | undefined;
  moms: Stock[] = [];
  dads: Stock[] = [];
  kids: Stock[] = [];

  constructor(
    public service: StockService,
  ) {
  }

  ngOnInit(): void {
  }

  initialize(stock: Stock)  {
    this.stockNameFC = new FormControl(null, [Validators.required, ValidateStockNameFC(this.service, stock)]);
    this.dobFC = new FormControl(null, [Validators.required, ValidateDobFC()]);
    this.momFC = new FormControl(null, [ValidateParentFC(this.service, this._stock)]);
    this.dadFC = new FormControl(null, [ValidateParentFC(this.service, this._stock)]);
    this.countEnteringNurseryFC = new FormControl(null, [Validators.min(0)]);
    this.countLeavingNurseryFC = new FormControl(null, [Validators.min(0)]);
    this.researcherFC = new FormControl();
    this.geneticsFC = new FormControl();
    this.commentFC = new FormControl();

    //------------------------- Stock Name --------------------------
    this.stockNameFC.valueChanges.subscribe((value: any) => {
      this._stock?.stockName.update(value);
      this._stock?.stockName.setValidity(this.stockNameFC.valid);
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
    // changes, we recheck the validity of the parents and kids.
    //------------------------- DOB --------------------------
    this.dobFC.valueChanges.subscribe((value: any) => {
      this._stock?.dob.update(value);
      this._stock?.dob.setValidity(this.dobFC.valid);
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
      this._stock?.mom.update(value);
      this._stock?.mom.setValidity(this.momFC.valid);
      if (this.momFC.invalid) {
        this.momFC.markAsTouched();
      }
      this.moms = this.service.getStocksByName(this._stock?.mom.current);
    })
    this.momFC.setValue(stock.mom.current);

    this.dadFC.valueChanges.subscribe((value: any) => {
      this._stock?.dad.update(value);
      this._stock?.dad.setValidity(this.dadFC.valid);
      if (this.dadFC.invalid) {
        this.dadFC.markAsTouched();
      }
      this.dads = this.service.getStocksByName(this._stock?.dad.current);
    })
    this.dadFC.setValue(stock.dad.current);

    //------------------------- Nursery Counts --------------------------
    this.countEnteringNurseryFC.valueChanges.subscribe((value: any) => {
      this._stock?.countEnteringNursery.update(String(value));
      this._stock?.countEnteringNursery.setValidity(this.countEnteringNurseryFC.valid);
    })
    this.countEnteringNurseryFC.setValue(stock.countEnteringNursery.current);

    this.countLeavingNurseryFC.valueChanges.subscribe((value: any) => {
      this._stock?.countLeavingNursery.update(String(value));
      this._stock?.countLeavingNursery.setValidity(this.countLeavingNurseryFC.valid);
    })
    this.countLeavingNurseryFC.setValue(stock.countLeavingNursery.current);

    //------------------------- Genetics & Comment --------------------------
    this.geneticsFC.valueChanges.subscribe((value: any) => {
      this._stock?.genetics.update(String(value));
    })
    this.geneticsFC.setValue(stock.genetics.current);

    this.commentFC.valueChanges.subscribe((value: any) => {
      this._stock?.comment.update(String(value));
    })
    this.commentFC.setValue(stock.comment.current);

    //------------------------- Researcher --------------------------
    this.researcherFC.valueChanges.subscribe((value: any) => {
      this._stock?.researcher.update(String(value));
      this.service.refreshStringsAndTokens();
    })
    this.researcherFC.setValue(stock.researcher.current);

  }

  refreshKids() {
    this.kids = this.service.getKids(this._stock?.stockName.current);
  }

  goToPrev() {
    if (this._stock) {
      const prevStock = this.service.getStockBefore(this._stock);
      if (prevStock) {
        this.service.selectItem(prevStock);
      }
    }
  }
  goToNext() {
    if (this._stock) {
      const nextStock = this.service.getStockAfter(this._stock);
      if (nextStock) {
        this.service.selectItem(nextStock);
      }
    }
  }
}

