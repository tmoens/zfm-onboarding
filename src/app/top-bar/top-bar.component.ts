import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AppStateService, WellKnownStates} from '../app-state.service';
import {ZFTool} from '../../helpers/zf-tool';
import {StockService} from '../stock-migrator/stock.service';
import * as XLSX from 'xlsx';
import {UserService} from '../user-migrator/user.service';
import {interval} from 'rxjs';

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
    public userService: UserService,
    private router: Router,
  ) {
  }

  async ngOnInit() {
  }

  async onFileSelected(event: any) {
    const file: File = event.target?.files[0];
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const binaryString: string = e.target.result;
      const inputWb: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary' });
      this.stockService.loadWorksheet(inputWb);

      // Now start a loop to save any patches to memory every minute
      this.userService.loadWorksheet(inputWb);
      interval(60000).subscribe(_ => {
        this.stockService.savePatchesToLocalStorage();
        this.userService.savePatchesToLocalStorage();
      })

    }
    reader.readAsBinaryString(file);
  }


  exportToExcel() {
    const wb = XLSX.utils.book_new();
    this.stockService.exportWorksheet(wb);
    this.userService.exportWorksheet(wb);
    XLSX.writeFile(wb, 'test.xlsx');
  }
}
