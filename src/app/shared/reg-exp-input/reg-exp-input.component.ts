import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {regularExpressionStringValidator} from '../../string-mauling/pattern-mapper/pattern-mapper';

@Component({
  selector: 'app-reg-exp-input',
  templateUrl: './reg-exp-input.component.html',
})
export class RegExpInputComponent implements OnInit {
  regExpStringFC: FormControl = new FormControl('.*', [Validators.required, regularExpressionStringValidator()]);
  @Input() regExpString: string | undefined;
  @Output() onRegExpChange: EventEmitter<RegExp> = new EventEmitter<RegExp>();
  @Output() onRegExpStringChange: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
    if (this.regExpString) {
      this.regExpStringFC.setValue(this.regExpString);
    }
    this.regExpStringFC.valueChanges.subscribe((regExpString: string) => {
      if (this.regExpStringFC.valid) {
        try {
          this.onRegExpChange.emit(new RegExp(this.regExpStringFC.value, 'i'));
          this.onRegExpStringChange.emit(this.regExpStringFC.value);
        } catch {
          // because the validity test does exactly the same try/catch, this catch
          // block should never get hit.  And if it does, fine, we just ignore
          // the failure which means no change events are triggered.
        }
      }
    })
  }
}
