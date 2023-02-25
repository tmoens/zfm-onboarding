import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {PatternMapper} from './pattern-mapper';
import {Observable, startWith, map} from 'rxjs';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatchDetailsDialogComponent} from './match-details-dialog/match-details-dialog.component';
import {GenericType} from '../../generics/generic-type';

@Component({
  selector: 'app-pattern-mapper[patternMapper]',
  templateUrl: './pattern-mapper.component.html',

})
export class PatternMapperComponent<TargetType extends GenericType> implements OnInit {
  commentFC: FormControl = new FormControl('');
  targetFC: FormControl = new FormControl('');

  dialogRef: MatDialogRef<MatchDetailsDialogComponent> | null = null;
  @Input() patternMapper!: PatternMapper<TargetType>;

  @Output() onRegExpChange: EventEmitter<string> = new EventEmitter<string>();
  mappingTargets: TargetType[] = [];
  filteredMappingTargets: Observable<TargetType[]> | undefined;
  private _targetHint: string = '';

  constructor(
    public matchDetailsDialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.patternMapper.service.list.subscribe((targets: TargetType[]) => this.mappingTargets = targets);
    this.commentFC.setValue(this.patternMapper.comment);
    if (this.patternMapper.target?.id) {
      this.targetFC.setValue(this.patternMapper.target.id);
    }
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
      const top = 125;
      const left = 125;
      this.dialogRef = this.matchDetailsDialog.open(MatchDetailsDialogComponent, {
        width: '350 px',
        position: {top: top + "px", left: left + "px"},
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
      this._targetHint = 'Unknown target';
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
