import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AppStateService} from "../app-state.service";
import {ZFTool} from '../../helpers/zf-tool';
import {StockService} from '../stock-migrator/stock.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})

export class TopBarComponent implements OnInit {
  zfTool = ZFTool;

  constructor(
    public appState: AppStateService,
    public stockService: StockService,
    private router: Router,
  ) {
  }

  async ngOnInit() {
  }

  exportToExcel() {
    this.stockService.exportToExcel();
  }
}
