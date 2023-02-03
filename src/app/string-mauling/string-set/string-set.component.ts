import {Component, Input, OnInit} from '@angular/core';
import {UniqueStringsAndTokens} from './unique-strings';


@Component({
  selector: 'app-string-set',
  templateUrl: './string-set.component.html',
})
export class StringSetComponent implements OnInit {

  constructor() {
  }
  stringsAndTokens: UniqueStringsAndTokens = new UniqueStringsAndTokens()
  @Input() set uniqueStringsAndTokens(ust: UniqueStringsAndTokens) {
    this.stringsAndTokens = ust;
  }
  @Input() showCount = true;


  ngOnInit(): void {
  }

}
