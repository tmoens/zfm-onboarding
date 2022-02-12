import {Component, OnInit} from '@angular/core';
import {AppStateService} from '../../app-state.service';
import {StockService} from '../stock.service';
import {AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {Stock} from '../stock';

@Component({
  selector: 'app-stock-patcher',
  templateUrl: './stock-patcher.component.html',
  styleUrls: ['./stock-patcher.component.css']
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

  constructor(
    public appState: AppStateService,
    public service: StockService,
    private route: ActivatedRoute,
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

    //------------------------- Stock Name --------------------------
    this.stockNameFC = new FormControl(null, [Validators.required, ValidateStockName(this.service, stock)]);
    this.stockNameFC.valueChanges.subscribe((value: any) => {
      this.stock?.stockName.update(value);
      if (this.stockNameFC.valid) this.stock?.stockName.patch(value);
      else this.stock?.stockName.unPatch();
    })
    this.stockNameFC.setValue(stock.stockName.best);

    //------------------------- DOB --------------------------
    this.dobFC = new FormControl(null, [Validators.required, ValidateDOB(this.service, this.stock)]);
    this.dobFC.valueChanges.subscribe((value: any) => {
      this.stock?.dob.update(value);
      if (this.dobFC.valid) this.stock?.dob.patch(value);
      else this.stock?.dob.unPatch();
    })
    this.dobFC.setValue(stock.dob.best);

    //------------------------- internal Mom & Dad --------------------------
    this.internalMomFC = new FormControl(null, [ValidateParent(this.service, this.stock)]);
    this.internalMomFC.valueChanges.subscribe((value: any) => {
      this.stock?.internalMom.update(value);
      if (this.internalMomFC.valid) {
        this.stock?.internalMom.patch(value);
        // this.mom = this.service.getStocksByName(this.stock?.internalMom) ?? undefined;
      } else {
        this.stock?.internalMom.unPatch();
      }
    })
    this.internalMomFC.setValue(stock.internalMom.best);

    this.internalDadFC = new FormControl(null, [ValidateParent(this.service, this.stock)]);
    this.internalDadFC.valueChanges.subscribe((value: any) => {
      this.stock?.internalDad.update(value);
      if (this.internalDadFC.valid) this.stock?.internalDad.patch(value);
      else this.stock?.internalDad.unPatch();
    })
    this.internalDadFC.setValue(stock.internalDad.best);

    //------------------------- external Mom & Dad --------------------------
    this.externalMomFC = new FormControl();
    this.externalMomFC.valueChanges.subscribe((value: any) => {
      this.stock?.externalMom.update(value);
      this.stock?.externalMom.patch(value);
    })
    this.externalMomFC.setValue(stock.externalMom.best);

    this.externalDadFC = new FormControl();
    this.externalDadFC.valueChanges.subscribe((value: any) => {
      this.stock?.externalDad.update(value);
      this.stock?.externalDad.patch(value);
    })
    this.externalDadFC.setValue(stock.externalDad.best);

    //------------------------- Nursery Counts --------------------------
    this.countEnteringNurseryFC = new FormControl(null, [Validators.min(0)]);
    this.countEnteringNurseryFC.valueChanges.subscribe((value: any) => {
      this.stock?.countEnteringNursery.update(String(value));
      if (this.countEnteringNurseryFC.valid) this.stock?.countEnteringNursery.patch(String(value));
      else this.stock?.countEnteringNursery.unPatch();
    })
    this.countEnteringNurseryFC.setValue(Number(stock.countEnteringNursery.best));

    this.countLeavingNurseryFC = new FormControl(null, [Validators.min(0)]);
    this.countLeavingNurseryFC.valueChanges.subscribe((value: any) => {
      this.stock?.countLeavingNursery.update(String(value));
      if (this.countLeavingNurseryFC.valid) this.stock?.countLeavingNursery.patch(String(value));
      else this.stock?.countLeavingNursery.unPatch();
    })
    this.countLeavingNurseryFC.setValue(Number(stock.countLeavingNursery.best));

    //------------------------- Genetics & Comment --------------------------
    this.geneticsFC = new FormControl();
    this.geneticsFC.valueChanges.subscribe((value: any) => {
      this.stock?.genetics.update(String(value));
      this.stock?.genetics.patch(String(value));
    })
    this.geneticsFC.setValue(stock.genetics.best);

    this.commentFC = new FormControl();
    this.commentFC.valueChanges.subscribe((value: any) => {
      this.stock?.comment.update(String(value));
      this.stock?.comment.patch(String(value));
    })
    this.commentFC.setValue(stock.comment.best);
  }


}

function ValidateStockName(service: StockService, stock: Stock): ValidatorFn {
  return (control: AbstractControl): ValidationErrors| null => {
    control.value;
    if (!Stock.validateStockName(control.value)) {
      return {invalid: '[0-9]*(\.[0-9]{2})?'}
    }
    const dups: Stock[] =  service.getStocksByName(control.value);
    if (dups.length > 1 || (dups.length === 1 && (dups[0].index !== stock.index))){
      const dupRows: number[] = [];
      for (const s of dups) {
        if (s.index !== stock.index) dupRows.push(s.row);
      }
      return {invalid: `In use in row(s): ${dupRows.join(", ")}`}
    }
    return null;
  }
}

function ValidateDOB(service: StockService, stock?: Stock): ValidatorFn {
  return (control: AbstractControl): ValidationErrors| null => {
    if (!Stock.validateDobString(control.value)) {
      return {invalid: 'Must be YYYY-MM-DD'}
    }
    const mom = (stock && stock.internalMom.current)  ? service.findStock(stock.internalMom.current)  : null;
    if (mom && mom.youngerThan(control.value)) {
      return {invalid: 'Time traveler! Older than mom'}
    }
    const dad = (stock && stock.internalDad.current)  ? service.findStock(stock.internalDad.current)  : null;
    if (dad && dad.youngerThan(control.value)) {
      return {invalid: 'Time traveler! Older than dad'}
    }
    return null;
  }
}
function ValidateParent(service: StockService, stock?: Stock): ValidatorFn {
  return (control: AbstractControl): ValidationErrors| null => {
    if (control.value) {
      const parent = service.findStock(control.value);
      if (!parent) {
        return {invalid: 'Parent does not exist'}
      }
      if (stock && stock.dob.current && parent.youngerThan(stock.dob.current)) {
        return {invalid: 'Time travel alert! Older than parent'}
      }
    }
    return null;
  }
}
