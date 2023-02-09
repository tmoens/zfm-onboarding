import {AttrPatch} from './attr-patch';


export class PatchableAttr {
  /**
   * Stores an attribute that holds both an original value and current value.
   *
   * @remarks
   * It supports the concept of an edit that is "in progress" but not committed.
   * A "patch" is simply the distilled "storable" version which contains only
   * the original and current versions of the attribute.
   */
  get original(): string {
    return this._original;
  }
  set original(value: string) {
    this._original = value;
  }

  private _original: string = '';

  get current(): string {
    return this._current;
  }
  set current(value: string) {
    this._current = value;
  }
  private _current: string = '';

  // whether the current value is valid.
  private _valid: boolean = true;

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

  // apply a "patch" to this attribute
  // FWIW this is done when re-loading objects and patches that are work in progress.
  applyPatch(patch?: AttrPatch) {
    if (patch && this.original === patch.o) this.update(patch.p);
  }

  // get a "patch" for this attribute that can be easily stored as text.
  extractPatch(): AttrPatch | null {
    if (!this.isPatched()) {
      return null;
    } else {
      return {o: this.original, p: this.current}
    }
  }

  initialize(s: string) {
    this.original = s.trim();
    this.current = this.original;
  }
}


