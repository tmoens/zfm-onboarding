import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Stock} from '../stock';
import {StockProblemFields} from '../stock-problem';
import {StockPatch} from '../stock-patch';
import {StockService} from '../stock.service';

@Component({
  selector: 'app-stock-viewer',
  templateUrl: './stock-viewer.component.html',
  styleUrls: ['./stock-viewer.component.css']
})
export class StockViewerComponent  {
  @Input() stock: Stock | undefined;
  @Input() patch: StockPatch | undefined
  StockProblemFields = StockProblemFields;
  constructor(
    private service: StockService,
  ) { }


}
