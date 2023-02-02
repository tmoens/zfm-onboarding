import {Component, Input, OnInit} from '@angular/core';


@Component({
  selector: 'app-string-set',
  templateUrl: './string-set.component.html',
})
export class StringSetComponent implements OnInit {

  constructor() {
  }
  uniqueStrings: {[index: string]: number } = {};
  uniqueTokens: {[index: string]: number } = {};
  @Input() set strings(strings: string[]) {
    this.uniqueStrings = {};
    this.uniqueTokens = {};
    strings.map((s: string) => {
      if (this.uniqueStrings[s]) {
        this.uniqueStrings[s]++;
      } else {
        this.uniqueStrings[s] = 1;
      }
      const tokens = s.split(/\W+/);
      tokens.map((t: string) => {
        if (this.uniqueTokens[t]) {
          this.uniqueTokens[t]++;
        } else {
          this.uniqueTokens[t] = 1;
        }
      });
    });
  }


  ngOnInit(): void {
  }

}
