import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, UntypedFormControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {PatternMapper} from './pattern-mapper';
import {Observable, startWith, map} from 'rxjs';
import {MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {MatchDetailsDialogComponent} from './match-details-dialog/match-details-dialog.component';
import {GenericType} from '../../generics/generic-type';

// I beg your forgiveness.  Initially a pattern mapper aped for one pattern to a single target object.
// After much kicking and scratching, it turned out that a single "owner" pattern could map to both a
// researcher and a PI.  So this thing is full of item0 and item1 which I would not have done
// had I thought that a single pattern could identify multiple targets.
@Component({
  selector: 'app-pattern-mapper[patternMapper]',
  templateUrl: './pattern-mapper.component.html',

})
export class PatternMapperComponent<TargetType extends GenericType> implements OnInit {
  commentFC: UntypedFormControl = new UntypedFormControl('');
  dialogRef: MatDialogRef<MatchDetailsDialogComponent> | null = null;
  mappingTargets: TargetType[] = [];
  @Input() patternMapper!: PatternMapper<TargetType>;
  target0FC: UntypedFormControl = new UntypedFormControl('');
  target1FC: UntypedFormControl = new UntypedFormControl('');
  @Input() targetCount: number = 1;

  @Output() onRegExpChange: EventEmitter<string> = new EventEmitter<string>();
  filteredMappingTargets0: Observable<TargetType[]> | undefined;
  filteredMappingTargets1: Observable<TargetType[]> | undefined;
  private _targetHint0: string = '';
  private _targetHint1: string = '';
  get targetHint0(): string {
    return this._targetHint0;
  }
  get targetHint1(): string {
    return this._targetHint1;
  }

  constructor(
    public matchDetailsDialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.patternMapper.service.list.subscribe((targets: TargetType[]) => {
      this.mappingTargets = targets;
    });
    this.commentFC.setValue(this.patternMapper.comment);
    this.target0FC.setValue(this.patternMapper.getTargetString(0));
    this.target0FC.addValidators([targetValidator(this.patternMapper)]);
    this.filteredMappingTargets0 = this.target0FC.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value)),
    );
    this.target0FC.valueChanges.subscribe((targetString: string) => {
      this.patternMapper.setTargetFromIdString(targetString, 0);
      this.setTargetHint0();
    })
    this.target1FC.setValue(this.patternMapper.getTargetString(1));
    this.target1FC.addValidators([targetValidator(this.patternMapper)]);
    this.filteredMappingTargets1 = this.target1FC.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value)),
    );
    this.target1FC.valueChanges.subscribe((targetString: string) => {
      this.patternMapper.setTargetFromIdString(targetString,1);
      this.setTargetHint1();
    })
    this.setTargetHint0();
    this.setTargetHint1();
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

  setTargetHint0() {
    const target: GenericType = this.patternMapper.getTarget(0);
    if (target) {
      this._targetHint0 = target.informalName
    } else {
      this._targetHint0 = `Select a target`;
    }
  }
  setTargetHint1() {
    const target: GenericType = this.patternMapper.getTarget(1);
    if (target) {
      this._targetHint1 = target.informalName
    } else {
      this._targetHint1 = `Select a target`;
    }
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
