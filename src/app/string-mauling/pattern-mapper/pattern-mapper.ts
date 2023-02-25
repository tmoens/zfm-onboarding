import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {GenericType} from '../../generics/generic-type';
import {PatternMapperDto} from './pattern-mapper-dto';
import {GenericService} from '../../generics/generic-service';

export class PatternMapper<T extends GenericType> {
  // A string containing a regular expression used for the matching process.
  private _regExpString: string = '';
  // A note about what this regular expression match is supposed to find.
  // Sometimes regular expressions can be arcane.
  comment: string = '';
  matches: {[index: string]: string[]} = {};
  matchCount = 0;
  // regexp without the global flag
  regExp: RegExp | null = null;
  // regexp with the global flag for replacements.
  gRegExp: RegExp | null = null;

  // The thing we are trying to map to (i.e. a transgene or mutation). If the
  // regular expression matches, it in a string, then bingo.
  public target: T | undefined;

  // A string identifying th thing we are trying to map to.
  public targetString: string = '';

  set regExpString(regExpString: string) {
    this._regExpString = regExpString;
    this.makeRegExpFromString();
  }
  get regExpString(): string {
    return this._regExpString;
  }

  constructor(
    public service: GenericService<GenericType>
  ) {
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

  mapStringToTarget(s: string): T | null {
    if (!this.target || !this.regExp) {
      return null;
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
    // operations because sometimes a pattern will match more than once in a given string.
    // So I have now got two versions of the regExp.
    if (this.regExp.test(s)) {
      return this.target;
    }
    return null;
  }

  get dto(): PatternMapperDto {
    this.clearResults();
    const pmDto: PatternMapperDto = {
      regExpString: this._regExpString,
      comment: this.comment,
      targetIdString: '',
    }
    if (this.target?.id) {
      pmDto.targetIdString = this.target.id;
    } else if (this.targetString) {
      pmDto.targetIdString = this.targetString
    }
    return pmDto;
  }

  reconstituteFromDto(dto: PatternMapperDto) {
    this.regExpString = dto.regExpString;
    if (dto.comment) {
      this.comment = dto.comment;
    }
    this.setTargetFromIdString(dto.targetIdString);
    if (dto.targetIdString && !this.target) {
      console.log(`Problem loading pattern mapper for ${dto.regExpString} - target ${dto.targetIdString} not found}`);
    }
  }

  setTargetFromIdString(id: string) {
    if (id) {
      this.targetString = id;
      this.target = this.service.findById(id) as T | undefined;
    } else {
      this.targetString = '';
      this.target = undefined;
    }
  }

  clearResults() {
    this.matches = {};
    this.matchCount = 0;
  }
}

export function regularExpressionStringValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    try {new RegExp(control.value);
      return null;
    } catch {
      return {invalidRegExp: 'Fix it'};
    }
  }
}
