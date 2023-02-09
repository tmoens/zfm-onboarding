import { Component, OnInit } from '@angular/core';
import {Tg} from '../tg';
import {TgService} from '../tg.service';

@Component({
  selector: 'app-tg-selector',
  templateUrl: './tg-selector.component.html',
})
export class TgSelectorComponent implements OnInit {
  newItem: Tg | null = null;
  constructor(
    public service: TgService,
  ) { }

  ngOnInit(): void {
    if (this.service.list.length > 0) {
      this.service.select(this.service.list[0]);
    }
  }

  select(user: Tg) {
    // navigation terminates the creation of a new user with extreme prejudice
    this.newItem = null;
    this.service.select(user);
  }

  create() {
    this.newItem = new Tg();
  }
  delete(user: Tg) {
    this.service.delete(user);
  }

  saveNewTg() {
    if (this.newItem) {
      this.service.add(this.newItem);
      this.newItem = null;
    }
  }
}