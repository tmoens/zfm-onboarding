import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {PatternMapper, regularExpressionStringValidator} from './pattern-mapper';
import {BehaviorSubject} from 'rxjs';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatchDetailsDialogComponent} from './match-details-dialog/match-details-dialog.component';

@Component({
  selector: 'app-pattern-mapper[patternMapper]',
  templateUrl: './pattern-mapper.component.html',

})
export class PatternMapperComponent implements OnInit {
  @ViewChild('foo') public thisElement!: ElementRef;
  regExpStringFC: FormControl = new FormControl('', [Validators.required, regularExpressionStringValidator()]);
  commentFC: FormControl = new FormControl('');
  targetFC: FormControl = new FormControl('');

  dialogRef: MatDialogRef<MatchDetailsDialogComponent> | null = null;
  @Input() patternMapper!: PatternMapper;

  @Input()
  targetType: string | null = null;
  @Input()
  mappingTargetsSource: BehaviorSubject<string[]> | null = null;
  @Output()
  onChange: EventEmitter<string> = new EventEmitter<string>();
  mappingTargets: string[] = [];

  constructor(
    public matchDetailsDialog: MatDialog,
  ) { }

  ngOnInit(): void {
    if (this.mappingTargetsSource) {
      this.mappingTargetsSource.subscribe((strings: string[]) => this.mappingTargets = strings);
    }
    this.regExpStringFC.setValue(this.patternMapper.regExpString);
    this.commentFC.setValue(this.patternMapper.comment);
    this.targetFC.setValue(this.patternMapper.target);
  }

  onChangeRegExp() {
    if (this.regExpStringFC.valid) {
      this.patternMapper.regExpString = this.regExpStringFC.value;
      this.onChange.emit('regExp')
    }
  }
  onChangeTarget() {
    this.patternMapper.target = this.targetFC.value;
    this.onChange.emit('target')
  }
  onChangeComment() {
    this.patternMapper.comment = this.targetFC.value;
  }

  openMatchDetailsDialog(): void {
    if (this.patternMapper.matchCount > 0) {
      const top = this.thisElement.nativeElement.offsetTop + 125;
      const left = this.thisElement.nativeElement.offsetLeft;
      this.dialogRef = this.matchDetailsDialog.open(MatchDetailsDialogComponent, {
        width: '350 px',
        position: {top: top + "px", left: left + "px"},
        data: this.patternMapper.matches,
        });
    }
  }
}
