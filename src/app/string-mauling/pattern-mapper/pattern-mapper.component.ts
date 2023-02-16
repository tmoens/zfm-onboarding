import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {PatternMapper, regularExpressionStringValidator} from './pattern-mapper';
import {BehaviorSubject, Observable, startWith, map} from 'rxjs';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatchDetailsDialogComponent} from './match-details-dialog/match-details-dialog.component';

@Component({
  selector: 'app-pattern-mapper[patternMapper]',
  templateUrl: './pattern-mapper.component.html',

})
export class PatternMapperComponent implements OnInit {
  regExpStringFC: FormControl = new FormControl('', [Validators.required, regularExpressionStringValidator()]);
  commentFC: FormControl = new FormControl('');
  targetFC: FormControl = new FormControl('');

  dialogRef: MatDialogRef<MatchDetailsDialogComponent> | null = null;
  @Input() patternMapper!: PatternMapper;

  @Input()
  targetType: string | null = null;
  @Input()
  mappingTargetsSource!: BehaviorSubject<string[]>;
  @Output()
  onChange: EventEmitter<string> = new EventEmitter<string>();
  mappingTargets: string[] = [];
  filteredMappingTargets: Observable<string[]> | undefined;

  constructor(
    public matchDetailsDialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.mappingTargetsSource.subscribe((strings: string[]) => this.mappingTargets = strings);
    this.regExpStringFC.setValue(this.patternMapper.regExpString);
    this.commentFC.setValue(this.patternMapper.comment);
    this.targetFC.setValue(this.patternMapper.target);
    this.filteredMappingTargets = this.targetFC.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  onChangeRegExp() {
    if (this.regExpStringFC.valid) {
      this.patternMapper.regExpString = this.regExpStringFC.value;
      this.onChange.emit('regExp')
    }
  }
  onChangeComment() {
    this.patternMapper.comment = this.targetFC.value;
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

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.mappingTargets.filter((option: string) => option.toLowerCase().includes(filterValue));
  }

}
