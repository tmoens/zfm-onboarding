import {Component, Input, OnInit} from '@angular/core';
import {UniqueStringsAndTokens} from './unique-strings';
import {BehaviorSubject} from 'rxjs';


@Component({
  selector: 'app-string-set',
  templateUrl: './string-set.component.html',
})
export class StringSetComponent implements OnInit {

  stringsAndTokens: UniqueStringsAndTokens = new UniqueStringsAndTokens()
  @Input() set uniqueStringsAndTokens(ust: UniqueStringsAndTokens) {
    this.stringsAndTokens = ust;
  }

  @Input() regExp!: BehaviorSubject<RegExp>;

  ngOnInit(): void {
  }
}
