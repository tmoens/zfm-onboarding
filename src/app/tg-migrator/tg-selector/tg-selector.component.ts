import {Component, Input, OnInit} from '@angular/core';
import {Tg} from '../tg';
import {TgService} from '../tg.service';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-tg-selector',
  templateUrl: './tg-selector.component.html',
})
export class TgSelectorComponent implements OnInit {

  filteredList: Tg[] = [];
  newItem: Tg | null = null;

  @Input() filteredListInput: BehaviorSubject<Tg[]> = new BehaviorSubject<Tg[]>([]);
  constructor(
    public service: TgService,
  ) { }


  ngOnInit(): void {
    this.filteredListInput.subscribe((tgs: Tg[]) => {
      this.filteredList = tgs;
    })
  }

  select(tg: Tg) {
    // navigation terminates the creation of a new user with extreme prejudice
    this.newItem = null;
    this.service.selectItem(tg);
  }

  create() {
    this.newItem = new Tg();
  }
  delete(user: Tg) {
    this.service.deleteItem(user);
  }

  saveNewItem() {
    if (this.newItem) {
      this.service.addItem(this.newItem);
      this.newItem = null;
    }
  }
  regExpFilterChange(regExp: RegExp) {
    this.service.regExpFilter = regExp;
  }

}
