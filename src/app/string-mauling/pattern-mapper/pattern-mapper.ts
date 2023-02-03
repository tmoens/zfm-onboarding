import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export class PatternMapper {
  // A string containing a regular expression used for the matching process.
  private _regExpString: string = '';
  // A note about what this regular expression match is supposed to find.
  // Sometimes regular expressions can be arcane.
  comment: string = '';
  // The thing we are trying to fine (e.g. a transgene or mutation). If the
  // regular expression matches, it in a string, then bingo.
  target: string = '';

  matches: {[index: string]: string[]} = {};
  matchCount = 0;
  private regExp: RegExp | null = null;

  set regExpString(regExpString: string) {
    this._regExpString = regExpString;
    try {
      this.regExp = new RegExp(regExpString, 'gi');
    } catch (e) {
      this.regExp = null;
    }
  }
  get regExpString(): string {
    return this._regExpString;
  }

  clearResults() {
    this.matches = {};
  }

  checkString(s: string): string {
    if (this.regExp) {
      const matches = s.match(this.regExp);
      if (matches) {
        for (const match of matches) {
          if (this.matches[s]) {
            this.matches[s].push(match);
          } else {
            this.matches[s] = [match];
          }
        }
      }
      this.matchCount = Object.keys(this.matches).length;
      return  s.replace(this.regExp, '');
    } else {
      return s;
    }
  }
}

export function regularExpressionStringValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    try {
      new RegExp(control.value);
      return null;
    } catch {
      return {invalidRegExp: 'Fix it'};
    }
  }
}
