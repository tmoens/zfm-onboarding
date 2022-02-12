import {ProblemType} from './stock-problems';

export class StockAttr {
  get original() {
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

  get patched(): string {
    return this._patched;
  }
  set patched(value: string) {
    this._patched = value;
  }
  private _patched: string = '';

  get required(): boolean {
    return this._required;
  }

  problems: ProblemType[] = [];

  constructor(
    private _required: boolean = false,
  ) {
  }

  get best(): string {
    if (this.patched) return this.patched;
    if (this.current) return this.current;
    return this.original;
  }
  patch (value: string) {
    if (this.original === value) {
      this.patched = '';
    } else {
      this.patched = value;
    }
  }
  unPatch () {
    this.patched = '';
  }
  update (value: string) {
    this.current = value;
  }

  hasProblems(unPatchedProblemsOnly: boolean = true): boolean {
    if (this.problems.length === 0) return false;
    return !(unPatchedProblemsOnly && this.isPatched());
  }
  addProblem(problem: ProblemType): void {
    this.problems.push(problem);
  }
  getProblems(): ProblemType[] {
    return this.problems;
  }


  hasChanged(value: string): boolean {
    return (this.original !== value);
  }
  isPatched(): boolean {
    return !!(this._patched);
  }
}


