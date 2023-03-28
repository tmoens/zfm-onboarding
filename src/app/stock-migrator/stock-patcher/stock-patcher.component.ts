import {Component, Input, OnInit} from '@angular/core';
import {StockService} from '../stock.service';
import {UntypedFormControl, Validators} from '@angular/forms';
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
  stockNameFC: UntypedFormControl;
  dobFC: UntypedFormControl;
  momFC: UntypedFormControl;
  dadFC: UntypedFormControl;
  countEnteringNurseryFC: UntypedFormControl;
  countLeavingNurseryFC: UntypedFormControl;
  researcherFC: UntypedFormControl;
  geneticsFC: UntypedFormControl;
  commentFC: UntypedFormControl;
  notesFC: UntypedFormControl;

  _stock: Stock | undefined;
  moms: Stock[] = [];
  dads: Stock[] = [];
  kids: Stock[] = [];

  nextStock: Stock | null = null;
  prevStock: Stock | null = null;

  constructor(
    public service: StockService,
  ) {
  }

  ngOnInit(): void {
    this.stockNameFC = new UntypedFormControl(null);
    this.stockNameFC.valueChanges.subscribe((value: any) => {
      if (value === this._stock.stockName.current) return;
      this._stock?.stockName.update(value);
      this._stock?.stockName.setValidity(this.stockNameFC.valid);
      this.refreshKids();
      // When a stock number changes it could wreak havoc.  Anyone pointing
      // to the old stock number as parent becomes broken and anyone
      // pointing to the new stock number as a parent needs to be checked.
      // So, inefficiently, just revalidate all the stocks.
      this.service.validateAll();
    })
    this.dobFC = new UntypedFormControl(null, [Validators.required, ValidateDobFC()]);
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
    //------------------------- Mom & Dad --------------------------
    this.momFC = new UntypedFormControl(null);
    this.momFC.valueChanges.subscribe((value: any) => {
      this._stock?.mom.update(value);
      this._stock?.mom.setValidity(this.momFC.valid);
      if (!this.momFC.valid) { this.momFC.markAsTouched(); }
      this.moms = this.service.getStocksByName(this._stock?.mom.current);
    })
    this.dadFC = new UntypedFormControl(null);
    this.dadFC.valueChanges.subscribe((value: any) => {
      this._stock?.dad.update(value);
      this._stock?.dad.setValidity(this.dadFC.valid);
      if (!this.dadFC.valid) { this.dadFC.markAsTouched(); }
      this.dads = this.service.getStocksByName(this._stock?.dad.current);
    })
    //------------------------- Nursery Counts --------------------------
    this.countEnteringNurseryFC = new UntypedFormControl(null, [Validators.min(0)]);
    this.countEnteringNurseryFC.valueChanges.subscribe((value: any) => {
      if (value === this._stock.countEnteringNursery.current) return;
      this._stock?.countEnteringNursery.update(String(value));
      this._stock?.countEnteringNursery.setValidity(this.countEnteringNurseryFC.valid);
    })
    this.countLeavingNurseryFC = new UntypedFormControl(null, [Validators.min(0)]);
    this.countLeavingNurseryFC.valueChanges.subscribe((value: any) => {
      if (value === this._stock.countLeavingNursery.current) return;
      this._stock?.countLeavingNursery.update(String(value));
      this._stock?.countLeavingNursery.setValidity(this.countLeavingNurseryFC.valid);
    })
    //------------------------- Genetics & Comment --------------------------
    this.geneticsFC = new UntypedFormControl();
    this.geneticsFC.valueChanges.subscribe((value: any) => {
      if (value === this._stock.genetics.current) return;
      this._stock?.genetics.update(String(value));
      this.service.refreshStringsAndTokens();
    })
    this.commentFC = new UntypedFormControl();
    this.commentFC.valueChanges.subscribe((value: any) => {
      if (value === this._stock.comment.current) return;
      this._stock?.comment.update(String(value));
    })
    //------------------------- Researcher --------------------------
    this.researcherFC = new UntypedFormControl();
    this.researcherFC.valueChanges.subscribe((value: any) => {
      if (value === this._stock.researcher.current) return;
      this._stock?.researcher.update(String(value));
      this.service.refreshStringsAndTokens();
    })
    this.notesFC = new UntypedFormControl();
  }

  initialize(stock: Stock)  {
    this.stockNameFC.setValidators([Validators.required, ValidateStockNameFC(this.service, stock)])
    this.momFC.setValidators(ValidateParentFC(this.service, stock));
    this.dadFC.setValidators(ValidateParentFC(this.service, stock));
    this.stockNameFC.setValue(stock.stockName.current);
    if (!stock.stockName.isValid()) this.stockNameFC.updateValueAndValidity();
    // Oh, lord.  You have to update mom and dad BEFORE you update the birthdate because
    // validity check looks at mom and dad's birthdate to make sure there is no
    // time travel monkey business.
    this.momFC.setValue(stock.mom.current);
    this.dadFC.setValue(stock.dad.current);
    // This must happen after mom and dad are updated.
    this.dobFC.setValue(stock.dob.current);
    this.countEnteringNurseryFC.setValue(stock.countEnteringNursery.current);
    this.countLeavingNurseryFC.setValue(stock.countLeavingNursery.current);
    this.geneticsFC.setValue(stock.genetics.current);
    this.commentFC.setValue(stock.comment.current);
    this.notesFC.setValue(stock.migrationNotes.current);
    this.researcherFC.setValue(stock.researcher.current);

    if (this._stock) {
      this.prevStock = this.service.getStockBefore(this._stock);
      this.nextStock = this.service.getStockAfter(this._stock);
    }
  }

  refreshKids() {
    this.kids = this.service.getKids(this._stock?.stockName.current);
  }

  goToPrev() {
    if (this.prevStock) {
      this.service.selectItem(this.prevStock);
    }
  }
  goToNext() {
    if (this.nextStock) {
      this.service.selectItem(this.nextStock);
    }
  }
  useDateFrom(s: Stock) {
    this.dobFC.setValue(s.dob.current);
  }
}

