import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AppStateService} from '../../app-state.service';
import {StockService} from '../stock.service';
import {Stock} from '../stock';
import {StockPatch} from '../stock-patch';
import {StockProblemFields} from '../stock-problem';
import {AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';

@Component({
  selector: 'app-stock-patcher',
  templateUrl: './stock-patcher.component.html',
  styleUrls: ['./stock-patcher.component.css']
})
export class StockPatcherComponent implements OnInit, OnChanges {
  StockProblemFields = StockProblemFields;

  // Form controls for the fields the user can patch
  stockNameFC: FormControl = new FormControl();
  dobFC: FormControl = new FormControl();
  momFC: FormControl = new FormControl();
  dadFC: FormControl = new FormControl();
  externalMomFC: FormControl = new FormControl();
  externalDadFC: FormControl = new FormControl();
  countEnteringNurseryFC: FormControl = new FormControl();
  countLeavingNurseryFC: FormControl = new FormControl();

  @Input() stock: Stock | undefined;
  @Input() patch: StockPatch | undefined;

  constructor(
    public appState: AppStateService,
    public service: StockService,
  ) {
  }

  ngOnInit(): void {
    this.stockNameFC = new FormControl(null,[ValidateStockName(this.service)]);
    this.stockNameFC.valueChanges.subscribe((value: any) => {
      if (this.stockNameFC.valid && this.patch) {
        this.patch.after.stockName = value;
      }
    })
    this.dobFC = new FormControl(null, [ValidateDOB(this.service, this.stock)]);
    this.dobFC.valueChanges.subscribe((value: any) => {
      if (this.dobFC.valid && this.patch) {
        this.patch.after.dob = value;
      }
    })
    this.momFC = new FormControl(null, [ValidateParent(this.service, this.stock)]);
    this.momFC.valueChanges.subscribe((value: any) => {
      if (this.momFC.valid && this.patch) {
        this.patch.after.internalMom = value;
      }
    })
    this.dadFC = new FormControl(null, [ValidateParent(this.service, this.stock)]);
    this.dadFC.valueChanges.subscribe((value: any) => {
      if (this.dadFC.valid && this.patch) {
        this.patch.after.internalDad = value;
      }
    })
    this.externalMomFC = new FormControl();
    this.externalMomFC.valueChanges.subscribe((value: any) => {
      if (value) {
        this.momFC.setValue('')
      }
    })
    this.externalDadFC = new FormControl();
    this.externalDadFC.valueChanges.subscribe((value: any) => {
      if (value) {
        this.dadFC.setValue('')
      }
    })
    this.countEnteringNurseryFC = new FormControl(null, [Validators.min(1),Validators.max(200)]);
    this.countEnteringNurseryFC.valueChanges.subscribe((value: any) => {
      if (this.countEnteringNurseryFC.valid && this.patch) {
        this.patch.after.countEnteringNursery = value;
      }
    })
    this.countLeavingNurseryFC = new FormControl(null, [Validators.min(1),Validators.max(200)]);
    this.countLeavingNurseryFC.valueChanges.subscribe((value: any) => {
      if (this.countLeavingNurseryFC.valid && this.patch) {
        this.patch.after.countLeavingNursery = value;
      }
    })
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.['patch']) {
      if (this.patch) {
        this.stockNameFC.setValue(this.patch.after.stockName);
        this.dobFC.setValue(this.patch.after.dob);
        this.momFC.setValue(this.patch.after.internalMom);
        this.dadFC.setValue(this.patch.after.internalDad);
        this.externalMomFC.setValue(this.patch.after.externalMom);
        this.externalDadFC.setValue(this.patch.after.externalDad);
        this.countEnteringNurseryFC.setValue(this.patch.after.countEnteringNursery);
        this.countLeavingNurseryFC.setValue(this.patch.after.countLeavingNursery);
      }
    }
  }
}

function ValidateStockName(service: StockService): ValidatorFn {
  return (control: AbstractControl): ValidationErrors| null => {
    control.value;
    if (!Stock.validateStockName(control.value)) {
      return {invalid: 'Must match regular expression: /d+(\.dd)?/'}
    }
    if (service.findStock(control.value)) {
      return {invalid: 'Stock already exists'}
    }
    return null;
  }
}
function ValidateDOB(service: StockService, stock?: Stock): ValidatorFn {
  return (control: AbstractControl): ValidationErrors| null => {
    if (!Stock.validateDobString(control.value)) {
      return {invalid: 'Must be YYYY-MM-DD'}
    }
    const mom = (stock && stock.internalMom) ? service.findStock(stock.internalMom) : null;
    if (mom && mom.youngerThan(control.value)) {
      return {invalid: 'Time traveler! Older than mom'}
    }
    const dad = (stock && stock.internalDad) ? service.findStock(stock.internalDad) : null;
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
      if (stock && stock.dob && parent.youngerThan(stock.dob)) {
        return {invalid: 'Time travel alert! Older than parent'}
      }
    }
    return null;
  }
}
