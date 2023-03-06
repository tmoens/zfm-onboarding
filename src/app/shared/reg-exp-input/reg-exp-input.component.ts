import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';

@Component({
  selector: 'app-reg-exp-input',
  templateUrl: './reg-exp-input.component.html',
})
export class RegExpInputComponent implements OnInit {
  regExpStringFC: FormControl = new FormControl('.*', [Validators.required, regularExpressionStringValidator()]);
  @Input() regExpString: string | undefined;
  @Input() fieldLabel: string = 'regExp';
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
          // because the regularExpressionStringValidator does exactly the same try/catch,
          // this catch block should never get hit.  And if it does, fine, we just ignore
          // the failure which means no change events are triggered.
        }
      }
    })
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
