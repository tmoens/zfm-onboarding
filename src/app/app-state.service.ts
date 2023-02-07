import {Inject, Injectable} from '@angular/core';
import {LOCAL_STORAGE, StorageService} from 'ngx-webstorage-service';
import {BehaviorSubject} from 'rxjs';
import {ZFTool} from '../helpers/zf-tool';

export enum WellKnownStates {
  ERROR_MESSAGE_DURATION = 'emd',
  CONFIRM_MESSAGE_DURATION = 'cmd',
  FACILITY = 'facility',
}

export enum ZFToolStates {
  ACTIVE_TOOL= 'active_tool'
}

const PERSISTED_STATES = 'persistedStates'

@Injectable({
  providedIn: 'root'
})

export class AppStateService {
  state: Map<string, any> = new Map<string, any>();
  persistedStates: string[] = [];
  defaults: Map<string, any> = new Map<string, any>();

  private _activeTool$: BehaviorSubject<ZFTool> = new BehaviorSubject<ZFTool>(ZFTool.SPLASH_LOGIN);
  private get activeTool$() {
    return this._activeTool$;
  }

  get activeTool() {
    return this.activeTool$.value;
  }

  constructor(
    @Inject(LOCAL_STORAGE) private localStorage: StorageService,
  ) {
    this.defaults.set(WellKnownStates.ERROR_MESSAGE_DURATION, 4000);
    this.defaults.set(WellKnownStates.CONFIRM_MESSAGE_DURATION, 2000);
    this.defaults.set(WellKnownStates.FACILITY, 'test');
  }

  initialize() {
    // load up the persistentState
    if (this.localStorage.has(PERSISTED_STATES)) {
      this.persistedStates = this.localStorage.get(PERSISTED_STATES);
      for (const ps of this.persistedStates) {
        this.state.set(ps, this.localStorage.get(ps));
      }
    }
  }

  setState(name: string, value: any, persist: boolean = false): void {
    if (persist) {
      if (this.persistedStates.indexOf(name) === -1) {
        this.persistedStates.push(name);
        this.localStorage.set(PERSISTED_STATES, this.persistedStates)
      }
      this.localStorage.set(name, value);
    }
    this.state.set(name, value);
  }

  deleteState(name:string): void {
    const index: number = this.persistedStates.indexOf(name);
    if (index > -1) {
      this.persistedStates.splice(index, 1)
      this.localStorage.set(PERSISTED_STATES, this.persistedStates)
      this.localStorage.remove(name);
    }
    if (this.state.has(name)) {
      this.state.delete(name);
    }
  }

  getState(name: string): any | null {
    if (this.state.has(name)) {
      return this.state.get(name);
    }
    if (this.defaults.has(name)) {
      return this.defaults.get(name);
    }
    return null;
  }

  // These next few are used to remember where the user was over restarts
  setActiveTool(tool: ZFTool) {
    this.localStorage.set(ZFToolStates.ACTIVE_TOOL, tool);
    this._activeTool$.next(tool);
  }

}
