import {AttrPatch} from './attr-patch';

export class StockAttr {
  // the original value of the attribute as read from a worksheet
  get original(): string {
    return this._original;
  }
  set original(value: string) {
    this._original = value;
  }
  private _original: string = '';

  // The current value of the attribute as entered by the user in the GUI
  get current(): string {
    return this._current;
  }
  set current(value: string) {
    this._current = value;
  }
  private _current: string = '';

  // whether the current value is valid.
  private _valid: boolean = true;

  constructor()   {
  }

  update (value: string) {
    this.current = value;
  }

  setValidity(value: boolean) {
    this._valid = value;
  }

  isValid(): boolean {
    return this._valid;
  }

  hasChanged(): boolean {
    return (this.original !== this.current);
  }
  isPatched(): boolean {
    return (this.hasChanged() && this.isValid());
  }

  // if there was an existing patch for this attr from the same baseline, reapply it
  applyPatch(patch?: AttrPatch) {
    if (patch && this.original === patch.o) this.update(patch.p);
  }

  extractPatch(): AttrPatch | null {
    if (!this.isPatched()) {
      return null;
    } else {
      return {o: this.original, p: this.current}
    }
  }
}


