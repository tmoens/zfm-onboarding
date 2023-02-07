import {Component, Input, OnInit} from '@angular/core';
import {Stock} from '../stock';
import {Router} from '@angular/router';
import {ZFTool} from '../../../helpers/zf-tool';

@Component({
  selector: 'app-stock-viewer',
  templateUrl: './stock-viewer.component.html',

})
export class StockViewerComponent implements OnInit {
  @Input() stock!: Stock;
  @Input() mini: boolean = false;
  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  patchStock() {
    this.router.navigate([ZFTool.STOCK_MIGRATOR.route + '/patch/' + this.stock.index]).then();
  }

}
