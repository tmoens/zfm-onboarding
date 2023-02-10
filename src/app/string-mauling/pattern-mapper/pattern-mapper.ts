import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {JsonForExcel} from '../../generics/json-for-excel';
import {Exclude, instanceToPlain} from 'class-transformer';

export class PatternMapper {
  // A string containing a regular expression used for the matching process.
  private _regExpString: string = '';
  // A note about what this regular expression match is supposed to find.
  // Sometimes regular expressions can be arcane.
  comment: string = '';
  // The thing we are trying to fine (e.g. a transgene or mutation). If the
  // regular expression matches, it in a string, then bingo.
  target: string = '';

  @Exclude()
  matches: {[index: string]: string[]} = {};
  @Exclude()
  matchCount = 0;
  // regexp without the global flag
  @Exclude()
  regExp: RegExp | null = null;
  // regexp with the global flag for replacements.
  @Exclude()
  gRegExp: RegExp | null = null;

  set regExpString(regExpString: string) {
    this._regExpString = regExpString;
    this.makeRegExpFromString();
  }
  get regExpString(): string {
    return this._regExpString;
  }

  makeRegExpFromString() {
    try {
      this.regExp = new RegExp(this.regExpString, 'i');
      this.gRegExp = new RegExp(this.regExpString, 'gi');
    } catch (e) {
      this.regExp = null;
      this.gRegExp = null;
    }
  }

  clearResults() {
    this.matches = {};
    this.matchCount = 0;
  }

  // remove any matches of this regExp pattern in a string returning a residual string
  removedMatchedBitsFromString(s: string): string {
    if (this.gRegExp) {
      const matches = s.match(this.gRegExp);
      if (matches) {
        for (const match of matches) {
          this.matches[s] = [match];
        }
      }
      this.matchCount = Object.keys(this.matches).length;
      return  s.replace(this.gRegExp, '');
    } else {
      return s;
    }
  }

  mapStringToTarget(s: string): string {
    if (!this.target || !this.regExp) {
      return '';
    }
    // A GIANT  wtf?  I used 'this.regExp.test(s)' originally as it is more efficient
    // But it produced a totally bizarre result.  On any two consecutive tests of the same
    // regexp against the same string that matched, gave a correct answer on the
    // first and not on the second.  Incredibly reproducible. Using 'match' works,
    // but I really hate it.
    // This just in.  This is known to happen if the regexp has a 'g' flag because
    // blah blah blah.  For now, I removed the 'g' flag when creating the regExp.
    // if (s.match(this.regExp)) {
    // Followed by further wtfageness. I cannot leave out the 'g' flag for further
    // operations.  So I have now got two versions of the regExp.
    if (this.regExp.test(s)) {
      return this.target;
    }
    return '';
  }

  get plain(): JsonForExcel {
    return instanceToPlain(this);
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
