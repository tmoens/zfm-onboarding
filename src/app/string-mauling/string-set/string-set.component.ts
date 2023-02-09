import {Component, Input, OnInit} from '@angular/core';
import {UniqueStringsAndTokens} from './unique-strings';
import {FormControl} from '@angular/forms';
import {regularExpressionStringValidator} from '../pattern-mapper/pattern-mapper';


@Component({
  selector: 'app-string-set',
  templateUrl: './string-set.component.html',
})
export class StringSetComponent implements OnInit {

  stringsAndTokens: UniqueStringsAndTokens = new UniqueStringsAndTokens()
  @Input() set uniqueStringsAndTokens(ust: UniqueStringsAndTokens) {
    this.stringsAndTokens = ust;
    this.stringsAndTokens.setStringFilter();
    this.stringsAndTokens.setTokenFilter();
  }
  @Input() showCount = true;

  stringFilterRegExpFC: FormControl = new FormControl (null, [regularExpressionStringValidator()]);
  tokenFilterRegExpFC: FormControl = new FormControl (null, [regularExpressionStringValidator()]);

  ngOnInit(): void {
  }

  onChangeTokenRegExp() {
    if (this.tokenFilterRegExpFC.valid) {
      this.stringsAndTokens.setTokenFilter(new RegExp(this.tokenFilterRegExpFC.value, 'gi'));
    }
  }
  onChangeStringRegExp() {
    if (this.stringFilterRegExpFC.valid) {
      this.stringsAndTokens.setStringFilter(new RegExp(this.stringFilterRegExpFC.value, 'gi'));
    }
  }

}
