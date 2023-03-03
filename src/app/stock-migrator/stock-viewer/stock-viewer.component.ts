import {Component, Input, OnInit} from '@angular/core';
import {Stock} from '../stock';
import {StockService} from '../stock.service';

@Component({
  selector: 'app-stock-viewer',
  templateUrl: './stock-viewer.component.html',

})
export class StockViewerComponent implements OnInit {
  @Input() stock!: Stock;
  @Input() mini: boolean = false;
  constructor(
    private stockService: StockService,
  ) { }

  ngOnInit(): void {
  }

  patchStock() {
    this.stockService.selectItem(this.stock)
  }
}
