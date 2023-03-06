import { Injectable } from '@angular/core';
import {GenericService} from '../generics/generic-service';
import {JsonForExcel} from '../generics/json-for-excel';
import {Mutation} from './mutation';

/**
 * Load customer's mutation information from a spreadsheet. The user augments or edits it.
 * Develop map from "genetics" information for stocks to these transgenes.
 **/
@Injectable({
  providedIn: 'root'
})
export class MutationService extends GenericService<Mutation>{
  serviceName = 'mutation';
  override get worksheetName(): string {
    return 'mutations';
  }


  override loadJsonItems(itemsFromWorksheet: JsonForExcel[]) {
    for (const jsonTg of itemsFromWorksheet) {
      const mutation = new Mutation();
      mutation.datafillFromJson(jsonTg);
      // Icky - while loading items we do not use the "add" method because that triggers
      // re-sorting, re-filtering and re-exporting data.
      this._list.push(mutation);
    }
  }

  override sortList() {
    this._list.sort((mutation1: Mutation, mutation2: Mutation) => {
      if (mutation1.gene.current.toLowerCase() > mutation2.gene.current.toLowerCase()) {
        return 1;
      } else {
        return -1;
      }
    })
    this.list.next(this._list);
  }

  override filterList() {
    if (this._regExpFilter) {
      this._filteredList = this._list.filter((mutation: Mutation) => {
        return (this._regExpFilter?.test(mutation.allele.current) ||
          this._regExpFilter?.test(mutation.gene.current) ||
          this._regExpFilter?.test(mutation.nickname.current));
      })
    }
    this.filteredList.next(this._filteredList);
  }
}
