import { Component, OnInit } from '@angular/core';
import {Tg} from '../tg';
import {TgService} from '../tg.service';
import {FormControl} from '@angular/forms';
import {regularExpressionStringValidator} from '../../string-mauling/pattern-mapper/pattern-mapper';

@Component({
  selector: 'app-tg-selector',
  templateUrl: './tg-selector.component.html',
})
export class TgSelectorComponent implements OnInit {

  filteredList: Tg[] = [];
  filterRegExpFC: FormControl = new FormControl (null, [regularExpressionStringValidator()]);
  newItem: Tg | null = null;
  constructor(
    public service: TgService,
  ) { }


  ngOnInit(): void {
    this.filteredList = this.service.list;
    if (this.service.list.length > 0) {
      this.service.selectItem(this.service.list[0]);
    }
  }

  select(user: Tg) {
    // navigation terminates the creation of a new user with extreme prejudice
    this.newItem = null;
    this.service.selectItem(user);
  }

  create() {
    this.newItem = new Tg();
  }
  delete(user: Tg) {
    this.service.deleteItem(user);
  }

  saveNewTg() {
    if (this.newItem) {
      this.service.addItem(this.newItem);
      this.newItem = null;
    }
  }
  onChangeFilterRegExp() {
    if (this.filterRegExpFC.valid) {
      const regExp: RegExp = new RegExp(this.filterRegExpFC.value, 'i');
      this.filteredList = this.service.list.filter((tg: Tg) => {
        return (regExp.test(tg.descriptor.current) || regExp.test(tg.allele.current));
      })
    }
  }

}
