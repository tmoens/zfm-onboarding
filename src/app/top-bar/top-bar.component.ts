import {Component, OnInit} from '@angular/core';
import {AppStateService, WellKnownStates} from '../app-state.service';
import {ZFTool} from '../../helpers/zf-tool';
import {StockService} from '../stock-migrator/stock.service';
import * as XLSX from 'xlsx';
import {ResearcherService} from '../user-migrator/researcher.service';
import {interval} from 'rxjs';
import {TgService} from '../tg-migrator/tg.service';
import {MutationService} from '../mutation-migrator/mutation.service';
import {PiService} from '../user-migrator/pi.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})

export class TopBarComponent implements OnInit {
  zfTool = ZFTool;

  regExpString: string = '.*'

  constructor(
    public appState: AppStateService,
    public stockService: StockService,
    public researcherService: ResearcherService,
    public piService: PiService,
    public transgeneService: TgService,
    public mutationService: MutationService,
  ) {
  }

  async ngOnInit() {
  }

  async onFileSelected(event: any) {
    const file: File = event.target?.files[0];
    const fileName: string = file.name.replace(/\s*\(\d*\)/, '');
    this.appState.setState(WellKnownStates.FILENAME, fileName);

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const binaryString: string = e.target.result;
      const inputWb: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary' });
      this.stockService.loadFromWorkbook(inputWb);
      this.researcherService.loadFromWorkbook(inputWb);
      this.piService.loadFromWorkbook(inputWb);
      this.transgeneService.loadFromWorkbook(inputWb);
      this.mutationService.loadFromWorkbook(inputWb);

      // Now start a loop to save any patches to memory every minute
      interval(60000).subscribe(_ => {
        this.stockService.savePatchesToLocalStorage();
        this.researcherService.savePatchesToLocalStorage();
        this.piService.savePatchesToLocalStorage();
        this.transgeneService.savePatchesToLocalStorage();
        this.mutationService.savePatchesToLocalStorage();
      })

    }
    reader.readAsBinaryString(file);
  }


  exportToExcel() {
    const wb = XLSX.utils.book_new();
    this.stockService.exportWorksheet(wb);
    this.researcherService.exportWorksheet(wb);
    this.piService.exportWorksheet(wb);
    this.transgeneService.exportWorksheet(wb);
    this.mutationService.exportWorksheet(wb);
    XLSX.writeFile(wb, this.appState.getState(WellKnownStates.FILENAME));
  }
}
