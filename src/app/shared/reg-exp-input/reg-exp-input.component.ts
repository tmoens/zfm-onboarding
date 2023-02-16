import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {regularExpressionStringValidator} from '../../string-mauling/pattern-mapper/pattern-mapper';

@Component({
  selector: 'app-reg-exp-input',
  templateUrl: './reg-exp-input.component.html',
})
export class RegExpInputComponent implements OnInit {
  regExpStringFC: FormControl = new FormControl('.*', [Validators.required, regularExpressionStringValidator()]);
  @Output() onChange: EventEmitter<RegExp> = new EventEmitter<RegExp>();

  constructor() { }

  ngOnInit(): void {
    this.regExpStringFC.valueChanges.subscribe((regExpString: string) => {
      if (this.regExpStringFC.valid) {
        try {
          this.onChange.emit(new RegExp(this.regExpStringFC.value, 'i'));
        } catch {
          // because the validity test does exactly the same try/catch, this catch
          // block should never get hit.  And if it does, fine, we just ignore
          // the failure which means no onChange is triggered.
        }
      }
    })
  }
}
