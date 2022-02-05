import { Component, OnInit } from '@angular/core';
import {debounceTime} from 'rxjs';
import {FormControl} from '@angular/forms';
import {Stock} from '../stock';
import {AppStateService} from '../../app-state.service';
import {StockService} from '../stock.service';

@Component({
  selector: 'app-stock-browser',
  templateUrl: './stock-browser.component.html',
  styleUrls: ['./stock-browser.component.css']
})
export class StockBrowserComponent implements OnInit {

  // A form control for the user to have a quick peek at any stock, by number
  stockFC: FormControl = new FormControl();
  stock: Stock | undefined;

  constructor(
    public appState: AppStateService,
    public service: StockService,
  ) { }

  ngOnInit(): void {
    this.stockFC.valueChanges
      .pipe(debounceTime(300))
      .subscribe((stockName: string) => {
        if (this.stock?.stockName !== stockName) {
          this.stock = this.service.findStock(stockName);
        }
      })
  }

  backOne() {
    if (this.stock) {
      this.stock = this.service.getStockBefore(this.stock);
      this.stockFC.setValue(this.stock.stockName)
    }
  }
  forwardOne() {
    if (this.stock) {
      this.stock = this.service.getStockAfter(this.stock);
      this.stockFC.setValue(this.stock.stockName)
    }
  }
}
