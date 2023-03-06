import {Component, OnInit} from '@angular/core';
import {StockService} from '../stock.service';
import {Stock} from '../stock';

@Component({
  selector: 'app-stock-selector',
  templateUrl: './stock-selector.component.html',
})
export class StockSelectorComponent implements OnInit {

  filteredList: Stock[] = [];
  constructor(
    public service: StockService,
  ) { }

  ngOnInit(): void {
  }
  select(stock: Stock) {
    this.service.selectItem(stock);
  }
}
