// You have a set of strings.  There is much replication between them and between parts of them.
// This class keeps all the unique strings and a count of how often they occur (because the user
// is often interested in the ones that occur the most often.
// It also breaks each string into tokens separated by whitespace and tracks how often each appears.
//
import {doubleWhiteSPaceRegExp, parenRegExp, tgRegExp} from '../useful-reg-exps';

export class UniqueStringsAndTokens {
  strings: {[index: string]: number} = {};
  filteredStrings: string[] = [];
  tokens: {[index: string]: number} = {}
  filteredTokens: string [] = [];

  // allow a space after the Tg

  addString(string: string, count = 1) {
    // tidy up whitespace including multiple consecutive whitespace characters
    let s = string.trim();
    s = s.replace(doubleWhiteSPaceRegExp, ' ')
    if (this.strings[s]) {
      this.strings[s] = this.strings[s] + count;
    } else {
      this.strings[s] = count;
    }

    // extract anything that looks like tg(a:g; g:y) as a token, then erase it;
    this.addTokens(s.match(tgRegExp), count);
    s = s.replace(tgRegExp, '');

    // extract anything enclosed in parens at token, then erase it.
    this.addTokens(s.match(parenRegExp), count);
    s = s.replace(parenRegExp, '');

    // finally split the thing with whitespace
    this.addTokens(s.split(/\s+/), count);

    // TODO we *could refresh the filtered list at this pont, but in practice it isn't needed
    // because all the strings are loaded before any filtering operations. Still.
  }

  addTokens(tokens: string[] | null, count = 1) {
    tokens?.map((token: string) => this.addToken(token, count));
  }
  addToken(s: string, count = 0) {
    if (this.tokens[s]) {
      this.tokens[s]++;
    } else {
      this.tokens[s] = 1;
    }
  }
  get stringCount(): number {
    return Object.keys(this.strings).length;
  }
  get tokenCount(): number {
    return Object.keys(this.tokens).length;
  }

  setStringFilter(regExp?: RegExp) {
    if (regExp) {
      this.filteredStrings = Object.keys(this.strings).filter((s: string) => {
        return regExp.test(s);
      })
    } else {
      this.filteredStrings = Object.keys(this.strings);
    }

  }

  setTokenFilter(regExp?: RegExp) {
    if (regExp) {
      this.filteredTokens = Object.keys(this.tokens).filter((s: string) => {
        return regExp.test(s);
      })
    } else {
      this.filteredTokens = Object.keys(this.tokens);
    }
  }

  get filteredStingsOrderedByFrequency(): StringFrequency[] {
    return this.filteredStrings.map((s: string) => {
      return new StringFrequency(s, this.strings[s]);
    }).sort((sf1: StringFrequency, sf2: StringFrequency): number => {
      if (sf1.frequency < sf2.frequency) {
        return 1;
      }
      if (sf1.frequency > sf2.frequency) {
        return -1;
      }
      if (sf1.string < sf2.string) {
        return 1;
      }
      if (sf1.string > sf2.string) {
        return -1;
      }
      return 0;
    })
  }
  get filteredTokensOrderedByFrequency(): StringFrequency[] {
    return this.filteredTokens.map((s: string) => {
      return new StringFrequency(s, this.tokens[s]);
    }).sort((sf1: StringFrequency, sf2: StringFrequency): number => {
      if (sf1.frequency < sf2.frequency) {
        return 1;
      }
      if (sf1.frequency > sf2.frequency) {
        return -1;
      }
      if (sf1.string < sf2.string) {
        return 1;
      }
      if (sf1.string > sf2.string) {
        return -1;
      }
      return 0;
    })
  }
  get filteredStingsOrderedByString(): StringFrequency[] {
    return this.filteredStrings.sort((s1, s2) => {
      if (s1 > s2) {
        return 1;
      } else {
        return -1;
      }
    }).map((s: string) => {
      return new StringFrequency(s, this.strings[s]);
    })
  }
  get filteredTokensOrderedByString(): StringFrequency[] {
    return this.filteredTokens.sort((s1, s2) => {
      if (s1 > s2) {
        return 1;
      } else {
        return -1;
      }
    }).map((s: string) => {
      return new StringFrequency(s, this.tokens[s]);
    })
  }

}

export class StringFrequency {
  constructor(
    public string: string,
    public frequency: number,
  ) {}
}
