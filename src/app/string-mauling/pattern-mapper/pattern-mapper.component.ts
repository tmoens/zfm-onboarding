import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PatternMapper} from './patternMapper';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-pattern-mapper',
  templateUrl: './pattern-mapper.component.html',

})
export class PatternMapperComponent implements OnInit {
  @Input()
  patternMapper: PatternMapper | null = null;
  @Input()
  targetType: string | null = null;
  @Input()
  mappingTargetsSource: BehaviorSubject<string[]> | null = null;
  mappingTargets: string[] = [];
  patternForm: FormGroup = this.fb.group({
    regExp: ['', Validators.required],
    comment: [''],
    name: ['']
  })

  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    if (this.patternMapper) {
      this.patternForm.setValue(this.patternMapper);
    }
    if (this.mappingTargetsSource) {
      this.mappingTargetsSource.subscribe((strings: string[]) => this.mappingTargets = strings);
    }
  }

  onFormChange() {
    console.log("gonna emit an event");
  }
}
