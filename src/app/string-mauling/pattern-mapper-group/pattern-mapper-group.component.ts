import {Component, Input, OnInit} from '@angular/core';
import {PatternMapper} from '../pattern-mapper/pattern-mapper';
import {GenericService} from '../../generics/generic-service';
import {GenericType} from '../../generics/generic-type';

@Component({
  selector: 'app-pattern-mapper-group',
  templateUrl: './pattern-mapper-group.component.html',
})
export class PatternMapperGroupComponent<TargetType extends GenericType> implements OnInit {
  patternMappers: PatternMapper<TargetType>[] = [];
  lastPMIndex = 0;

  @Input() service!: GenericService<GenericType>;

  constructor() { }

  ngOnInit(): void {
    this.service.patternMappers.subscribe((patternMappers: PatternMapper<TargetType>[]) => {
      this.patternMappers = patternMappers;
      this.lastPMIndex = patternMappers.length -1;
    })
  }

  create() {
    this.service.createPatternMapper()
  }

  delete(pm: PatternMapper<TargetType>) {
    this.service.deletePatternMapper(pm);
  }
  onChange(pm: PatternMapper<TargetType>) {
    this.service.saveAndExportPatternMappers();
  }
  move(pm: PatternMapper<TargetType>, direction : 'up' | 'down' | 'top' | 'bottom' | number) {
    this.service.movePatternMapper(pm, direction);
  }
  disableUp(i: number): boolean {
    return (i < 1);
  }
  disableDown(i: number): boolean {
    return (i >= this.patternMappers.length - 1);
  }
}
