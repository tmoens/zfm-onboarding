// You have a set of strings.  There is much replication between them and between parts of them.
// This class keeps all the unique strings and a count of how often they occur (because the user
// is often interested in the ones that occur the most often.
// It also breaks each string into tokens separated by whitespace and tracks how often each appears.
//
export class UniqueStringsAndTokens {
  strings: {[index: string]: number} = {};
  tokens: {[index: string]: number} = {}
  addString(s: string) {
    if (this.strings[s]) {
      this.strings[s]++;
    } else {
      this.strings[s] = 1;
    }
    const tokens = s.split(/\W+/);
    tokens.map((t: string) => {
      if (this.tokens[t]) {
        this.tokens[t]++;
      } else {
        this.tokens[t] = 1;
      }
    });
  }
}
