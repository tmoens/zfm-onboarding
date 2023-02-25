import {Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Mutation} from '../mutation';
import {MutationService} from '../mutation.service';

@Component({
  selector: 'app-mutation-selector',
  templateUrl: './mutation-selector.component.html',
})
export class MutationSelectorComponent implements OnInit {

  filteredList: Mutation[] = [];
  newItem: Mutation | null = null;

  @Input() filteredListInput: BehaviorSubject<Mutation[]> = new BehaviorSubject<Mutation[]>([]);
  constructor(
    public service: MutationService,
  ) { }


  ngOnInit(): void {
    this.filteredListInput.subscribe((mutations: Mutation[]) => {
      this.filteredList = mutations;
    })
  }

  select(mutation: Mutation) {
    // navigation terminates the creation of a new user with extreme prejudice
    this.newItem = null;
    this.service.selectItem(mutation);
  }

  create() {
    this.newItem = new Mutation();
  }
  delete(mutation: Mutation) {
    this.service.deleteItem(mutation);
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
