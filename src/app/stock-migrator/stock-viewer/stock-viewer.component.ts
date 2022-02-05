import {Component, Input, OnInit} from '@angular/core';
import {Stock} from '../stock';
import {StockProblemFields} from '../stock-problem';

@Component({
  selector: 'app-stock-viewer',
  templateUrl: './stock-viewer.component.html',
  styleUrls: ['./stock-viewer.component.css']
})
export class StockViewerComponent implements OnInit {
  @Input() stock: Stock | undefined;
  StockProblemFields = StockProblemFields;
  constructor() { }

  ngOnInit(): void {
  }

}
