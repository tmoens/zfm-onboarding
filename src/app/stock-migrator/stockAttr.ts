export class StockAttr {
  // the original value of the attribute as read from a worksheet
  get original() {
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

  get required(): boolean {
    return this._required;
  }

  constructor(
    private _required: boolean = false,
  ) {
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
}


