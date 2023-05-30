import {Component, OnInit, ViewChild} from '@angular/core';
import {Frequency, Options, RRule, Weekday} from 'rrule';
import {toNativeDate} from '../recurring-event-chooser/recurring-event-picker.component';

@Component({
  selector: 'app-custom-recurrence-input',
  templateUrl: './custom-recurrence-input.component.html',
  styleUrls: ['./custom-recurrence-input.component.scss']
})
export class CustomRecurrenceInputComponent implements OnInit {
  constructor() { }

  readonly RRule = RRule;

  INCASE_NOT_SUPPORTED = 'NOT-SUPPORTED';

  @ViewChild('mon') mo;
  @ViewChild('tu') tu;
  @ViewChild('we') we;
  @ViewChild('th') th;
  @ViewChild('fr') fr;
  @ViewChild('sa') sa;
  @ViewChild('su') su;
  @ViewChild('d2') endsDateInput;

  startTime: any = {hour: 1, minute: 1, second: 1};
  startDate: any = {year: 2023, month: 5, day: 30};
  weekdayMap: Weekday[] = [];
  endsDate: any = {year: 2024, month: 1, day: 2};

  rrule: any;
  nlp: any;
  cron: any;
  error: any;
  encodedRule: any;

  ngOnInit(): void {
  }

  setWeekday(isAdded: boolean, weekday: Weekday): void {
    console.log('before: weekdayMap: ', this.weekdayMap);
    if (isAdded) {
      this.weekdayMap.push(weekday);
    } else {
      this.weekdayMap = this.weekdayMap.filter((value) => value !== weekday);
    }
    console.log('after: weekdayMap: ', this.weekdayMap);
  }


  convert(): void {
    try {
      // tslint:disable-next-line:max-line-length
      console.log('start time: ', this.startTime, 'start date: ', this.startDate, 'weekdaymap: ', this.weekdayMap, 'enddate: ', this.endsDate);
      const options: Partial<Options> = {
        freq: Frequency.WEEKLY,
        dtstart: toNativeDate(this.startDate, this.startTime),
        until: toNativeDate(this.endsDate),
        byweekday: this.weekdayMap,
      };
      console.log('options', options);
      const rule = new RRule(options, false);
      this.rrule = rule.toString();
      console.log(rule.toString());
      this.nlp = rule.toText();
      this.cron = this.rtoc(this.rrule);
    } catch (e) {
      this.error = e;
    }
  }

  rtoc(r: any): string {
    r = r.replace('RRULE:', '');
    const C_DAYS_OF_WEEK_RRULE = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
    const C_DAYS_WEEKDAYS_RRULE = ['MO', 'TU', 'WE', 'TH', 'FR'];
    const C_DAYS_OF_WEEK_CRONE = ['2', '3', '4', '5', '6', '7', '1'];
    const C_DAYS_OF_WEEK_CRONE_NAMED = [
      'MON',
      'TUE',
      'WED',
      'THU',
      'FRI',
      'SAT',
      'SUN'
    ];
    const C_MONTHS = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC'
    ];
    let result = '';
    const dayTime = '0 0 0';
    let dayOfMonth = '?';
    let month = '*';
    let dayOfWeek = '?';
    const year = '*';

    let FREQ = '';
    let INTERVAL = -1;
    let BYMONTHDAY = '-1';
    let BYMONTH = -1;
    let BYDAY = '';
    let BYSETPOS = 0;

    const rarr = r.split(';');
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < rarr.length; i++) {
      const param = rarr[i].split('=')[0];
      const value = rarr[i].split('=')[1];
      if (param === 'FREQ') { FREQ = value; }
      // tslint:disable-next-line:radix
      if (param === 'INTERVAL') { INTERVAL = parseInt(value); }
      // tslint:disable-next-line:radix
      if (param === 'BYMONTHDAY') { BYMONTHDAY = value; }
      if (param === 'BYDAY') { BYDAY = value; }
      // tslint:disable-next-line:radix
      if (param === 'BYSETPOS') { BYSETPOS = parseInt(value); }
      // tslint:disable-next-line:radix
      if (param === 'BYMONTH') { BYMONTH = parseInt(value); }
    }
    if (FREQ === 'MONTHLY') {
      if (INTERVAL === 1) {
        month = '*'; // every month
      } else {
        month = '1/' + INTERVAL; // 1 - start of january, every INTERVALth month
      }
      if (BYMONTHDAY !== '-1') {
        dayOfMonth = BYMONTHDAY.toString();
      } else if (BYSETPOS !== 0) {
        // tslint:disable-next-line:triple-equals
        if (BYDAY == '') {
          console.error('No BYDAY specified for MONTHLY/BYSETPOS rule');
          return this.INCASE_NOT_SUPPORTED;
        }

        if (BYDAY === 'MO,TU,WE,TH,FR') {
          if (BYSETPOS === 1) {
            // First weekday of every month
            // 'FREQ=MONTHLY;INTERVAL=1;BYSETPOS=1;BYDAY=MO,TU,WE,TH,FR',
            dayOfMonth = '1W';
          } else if (BYSETPOS === -1) {
            // Last weekday of every month
            // 'FREQ=MONTHLY;INTERVAL=1;BYSETPOS=-1;BYDAY=MO,TU,WE,TH,FR',
            dayOfMonth = 'LW';
          } else {
            console.error(
              'Unsupported Xth weekday for MONTHLY rule (only 1st and last weekday are supported)'
            );
            return this.INCASE_NOT_SUPPORTED;
          }
          // tslint:disable-next-line:triple-equals
        } else if (C_DAYS_OF_WEEK_RRULE.indexOf(BYDAY) == -1) {
          console.error(
            'Unsupported BYDAY rule (multiple days are not supported by crone): ' +
            BYDAY
          );
          return this.INCASE_NOT_SUPPORTED;
        } else {
          dayOfMonth = '?';
          if (BYSETPOS > 0) {
            // 3rd friday = BYSETPOS=3;BYDAY=FR in RRULE, 6#3
            dayOfWeek =
              C_DAYS_OF_WEEK_CRONE[C_DAYS_OF_WEEK_RRULE.indexOf(BYDAY)] +
              '#' +
              BYSETPOS.toString();
          } else {
            // last specific day
            dayOfWeek =
              C_DAYS_OF_WEEK_CRONE[C_DAYS_OF_WEEK_RRULE.indexOf(BYDAY)] + 'L';
          }
        }
      } else {
        console.error('No BYMONTHDAY or BYSETPOS in MONTHLY rrule');
        return this.INCASE_NOT_SUPPORTED;
      }
    }

    if (FREQ === 'WEEKLY') {
      // tslint:disable-next-line:triple-equals
      if (INTERVAL != 1) {
        console.error('every X week different from 1st is not supported');
        return this.INCASE_NOT_SUPPORTED;
      }
      if (
        BYDAY.split(',').sort().join(',') ===
        C_DAYS_OF_WEEK_RRULE.concat().sort().join(',')
      ) {
        dayOfWeek = '*'; // all days of week
      } else {
        const arrByDayRRule = BYDAY.split(',');
        const arrByDayCron = [];
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < arrByDayRRule.length; i++) {
          const indexOfDayOfWeek = C_DAYS_OF_WEEK_RRULE.indexOf(arrByDayRRule[i]);
          arrByDayCron.push(C_DAYS_OF_WEEK_CRONE_NAMED[indexOfDayOfWeek]);
        }
        dayOfWeek = arrByDayCron.join(',');
      }
    }

    if (FREQ === 'DAILY') {
      // tslint:disable-next-line:triple-equals
      if (INTERVAL != 1) {
        dayOfMonth = '1/' + INTERVAL.toString();
      }
    }

    if (FREQ === 'YEARLY') {
      // tslint:disable-next-line:triple-equals
      if (BYMONTH == -1) {
        console.error('Missing BYMONTH in YEARLY rule');
        return this.INCASE_NOT_SUPPORTED;
      }
      month = C_MONTHS[BYMONTH - 1];
      // tslint:disable-next-line:triple-equals
      if (BYMONTHDAY != '-1') {
        // FREQ=YEARLY;BYMONTH=3;BYMONTHDAY=2  // 2nd day of March
        dayOfMonth = BYMONTHDAY;
      } else {
        // tslint:disable-next-line:triple-equals
        if (BYSETPOS == -1) {
          if (
            BYDAY.split(',').sort().join(',') ===
            C_DAYS_OF_WEEK_RRULE.concat().sort().join(',')
          ) {
            dayOfMonth = 'L';
          } else if (
            BYDAY.split(',').sort().join(',') ===
            C_DAYS_WEEKDAYS_RRULE.concat().sort().join(',')
          ) {
            dayOfMonth = 'LW';
          } else {
            console.error(
              'Last weekends and just last specific days of Month are not supported'
            );
            return this.INCASE_NOT_SUPPORTED;
          }
        } else {
          if (
            BYDAY.split(',').sort().join(',') ===
            C_DAYS_WEEKDAYS_RRULE.concat().sort().join(',') &&
            // tslint:disable-next-line:triple-equals
            BYSETPOS == 1
          ) {
            dayOfMonth = BYSETPOS.toString() + 'W';
            // tslint:disable-next-line:triple-equals
          } else if (BYDAY.split(',').length == 1) {
            dayOfWeek =
              C_DAYS_OF_WEEK_CRONE[C_DAYS_OF_WEEK_RRULE.indexOf(BYDAY)] +
              '#' +
              BYSETPOS.toString();
          } else {
            console.error('Multiple days are not supported in YEARLY rule');
            return this.INCASE_NOT_SUPPORTED;
          }
        }
      }
    }

    result = `${dayTime} ${dayOfMonth} ${month} ${dayOfWeek} ${year}`;
    return result;
  }

  clear(): void {
    this.mo.nativeElement.checked = false;
    this.tu.nativeElement.checked = false;
    this.we.nativeElement.checked = false;
    this.th.nativeElement.checked = false;
    this.fr.nativeElement.checked = false;
    this.sa.nativeElement.checked = false;
    this.su.nativeElement.checked = false;
    this.error = null;
    this.startTime = null;
    this.startDate = null;
    this.endsDate = null;
    this.weekdayMap = [];
    this.nlp = null;
    this.cron = null;
    this.rrule = null;
    this.encodedRule = null;
    console.log(this.weekdayMap);
  }

  decode(): void {
    const ruleStr = this.encodedRule.replace(' ', '\n');
    console.log('rule string: ', ruleStr);
    const rrule = RRule.fromString(ruleStr);
    this.rrule = rrule.toString();
    this.nlp = rrule.toText();
    this.cron = this.rtoc(this.rrule);
    const options = rrule.options;
    this.startTime = {
      hour: options.dtstart.getUTCHours(),
      minute: options.dtstart.getUTCMinutes(),
      seconds: options.dtstart.getUTCSeconds()
    };
    this.startDate = {
      year: options.dtstart.getFullYear(),
      month: options.dtstart.getUTCMonth() + 1,
      day: options.dtstart.getUTCDate()
    };
    this.weekdayMap = options.byweekday.map(index => new Weekday(index));
    this.endsDate = {
      year: options.until.getFullYear(),
      month: options.until.getUTCMonth() + 1,
      day: options.until.getUTCDate()
    };
    this.weekdayMap.forEach(weekday => {
      console.log('weekday: ', weekday.weekday);
      switch (weekday.weekday) {
        case 0:
          this.mo.nativeElement.checked = true;
          break;
        case 1:
          this.tu.nativeElement.checked = true;
          break;
        case 2:
          this.we.nativeElement.checked = true;
          break;
        case 3:
          this.th.nativeElement.checked = true;
          break;
        case 4:
          this.fr.nativeElement.checked = true;
          break;
        case 5:
          this.sa.nativeElement.checked = true;
          break;
        case 6:
          this.su.nativeElement.checked = true;
          break;
      }
    });
  }
  isChecked(index: number): boolean {
    return this.weekdayMap.includes(new Weekday(index));
  }
}
