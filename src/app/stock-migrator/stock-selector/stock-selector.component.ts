import {Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {StockService} from '../stock.service';
import {Stock} from '../stock';

@Component({
  selector: 'app-stock-selector',
  templateUrl: './stock-selector.component.html',
})
export class StockSelectorComponent implements OnInit {

  filteredList: Stock[] = [];
  @Input() filteredListInput: BehaviorSubject<Stock[]> = new BehaviorSubject<Stock[]>([]);
  constructor(
    public service: StockService,
  ) { }

  ngOnInit(): void {
    this.filteredListInput.subscribe((stocks: Stock[]) => {
      this.filteredList = stocks;
      this.filteredList.map((stock: Stock) => {
        console.log(`WTF? ${stock.stockName}`);
      })
    })
  }

  select(stock: Stock) {
    this.service.selectItem(stock);
  }

  regExpFilterChange(regExp: RegExp) {
    this.service.regExpFilter = regExp;
  }
}
