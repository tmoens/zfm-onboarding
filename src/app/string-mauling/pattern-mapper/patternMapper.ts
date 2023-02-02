export class PatternMapper<T> {
  regExp: RegExp = /.*/;
  comment: string = '';
  mapsTo: T | null = null;
}
