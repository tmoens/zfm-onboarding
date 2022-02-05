import {Inject, Injectable} from '@angular/core';
import {LOCAL_STORAGE, StorageService} from 'ngx-webstorage-service';

export enum WellKnownStates {
  ERROR_MESSAGE_DURATION = 'emd',
  CONFIRM_MESSAGE_DURATION = 'cmd',
  FACILITY = 'facility',
}

@Injectable({
  providedIn: 'root'
})

export class AppStateService {
  state: Map<string, any> = new Map<string, any>();
  defaults: Map<string, any> = new Map<string, any>();

  constructor(
    @Inject(LOCAL_STORAGE) private persistentState: StorageService,
  ) {
    this.defaults.set(WellKnownStates.ERROR_MESSAGE_DURATION, 4000);
    this.defaults.set(WellKnownStates.CONFIRM_MESSAGE_DURATION, 2000);
    this.defaults.set(WellKnownStates.FACILITY, 'test');
  }

  setState(name: string, value: any, persist: boolean = false): void {
    if (persist) {
      this.persistentState.set(name, value);
    } else {
      this.state.set(name, value);
    }
  }

  deleteState(name:string): void {
    if (this.persistentState.has(name)) {
      this.persistentState.remove(name);
    }
    if (this.state.has(name)) {
      this.state.delete(name);
    }
  }

  getState(name: string): any | null {
    if (this.persistentState.has(name)) {
      return this.persistentState.get(name);
    }
    if (this.state.has(name)) {
      return this.state.get(name);
    }
    if (this.defaults.has(name)) {
      return this.defaults.get(name);
    }
    return null;
  }
}
