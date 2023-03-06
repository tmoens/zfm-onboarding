import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, UntypedFormControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {PatternMapper} from './pattern-mapper';
import {Observable, startWith, map} from 'rxjs';
import {MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {MatchDetailsDialogComponent} from './match-details-dialog/match-details-dialog.component';
import {GenericType} from '../../generics/generic-type';

@Component({
  selector: 'app-pattern-mapper[patternMapper]',
  templateUrl: './pattern-mapper.component.html',

})
export class PatternMapperComponent<TargetType extends GenericType> implements OnInit {
  commentFC: UntypedFormControl = new UntypedFormControl('');
  dialogRef: MatDialogRef<MatchDetailsDialogComponent> | null = null;
  mappingTargets: TargetType[] = [];
  @Input() patternMapper!: PatternMapper<TargetType>;
  targetFC: UntypedFormControl = new UntypedFormControl('');

  @Output() onRegExpChange: EventEmitter<string> = new EventEmitter<string>();
  filteredMappingTargets: Observable<TargetType[]> | undefined;
  private _targetHint: string = '';

  constructor(
    public matchDetailsDialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.patternMapper.service.list.subscribe((targets: TargetType[]) => this.mappingTargets = targets);
    this.commentFC.setValue(this.patternMapper.comment);
    this.targetFC.setValue(this.patternMapper.targetString);
    this.targetFC.addValidators([targetValidator(this.patternMapper)]);
    this.filteredMappingTargets = this.targetFC.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value)),
    );
    this.targetFC.valueChanges.subscribe((targetString: string) => {
      this.patternMapper.setTargetFromIdString(targetString);
      this.setTargetHint();
    })
    this.setTargetHint();
  }

  onRegExpStringChange(regExpString: string) {
    this.patternMapper.regExpString = String(regExpString)
    this.onRegExpChange.emit(regExpString)
  }
  onChangeComment() {
    this.patternMapper.comment = this.commentFC.value;
  }

  openMatchDetailsDialog(): void {
    if (this.patternMapper.matchCount > 0) {
      this.dialogRef = this.matchDetailsDialog.open(MatchDetailsDialogComponent, {
        width: '350 px',
        height: '90%',
        data: this.patternMapper.matches,
      });
    }
  }

  setTargetHint() {
    if (!this.patternMapper.targetString) {
      this._targetHint = 'Select a target...'
    } else if (this.patternMapper.target) {
      this._targetHint = this.patternMapper.target.informalName;
    } else {
      this._targetHint = 'hmmmmm';
    }
  }

  get targetHint(): string {
    return this._targetHint;
  }

  private _filter(value: string): TargetType[] {
    if (!value) {
      return this.mappingTargets;
    } else {
      const filterValue = value.toLowerCase();
      return this.mappingTargets.filter((option: TargetType) =>
        option.id.toLowerCase().includes(filterValue) || option.informalName.includes(filterValue)
      );
    }
  }
}

function targetValidator(pm: PatternMapper<any>): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const targetIdString = control.value;
    if (!targetIdString) {
      return null;
    }
    if (pm.service.findById(targetIdString)) {
      return null;
    }
    // the next line allows the target to show errors when creating the pattern mapper
    // so if it was saved with an error, it is reconstituted with an error
    control.markAsTouched();
    return {unknownTarget: "Unknown Target"};
  }
}
