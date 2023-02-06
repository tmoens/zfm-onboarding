import {Component, Input, OnInit} from '@angular/core';
import {PatchableAttr} from '../../generics/patchable-attr';

@Component({
  selector: 'app-stock-attr-viewer',
  templateUrl: './stock-attr-viewer.component.html',
  styleUrls: ['./stock-attr-viewer.component.scss']
})
export class StockAttrViewerComponent implements OnInit {
  @Input() attr!: PatchableAttr | undefined;
  @Input() label: string = '';
  constructor() { }

  ngOnInit(): void {
  }

}
