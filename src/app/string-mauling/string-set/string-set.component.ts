import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-string-set',
  templateUrl: './string-set.component.html',
})
export class StringSetComponent implements OnInit {

  constructor() { }

  uniqueStrings: Set<string> = new Set<string>();
  uniqueTokens: Set<string> =new Set<string>();
  @Input() set strings(strings: Set<string>) {
    this.uniqueStrings = strings;
    strings.forEach((s: string) => {
        const tokens = s.split(/\W+/);
        tokens.map((t: string) => {
          this.uniqueTokens.add(t);
        });
    })
  }


  ngOnInit(): void {
  }

}
