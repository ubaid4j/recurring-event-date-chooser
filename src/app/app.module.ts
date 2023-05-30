import { MbscModule } from '@mobiscroll/angular';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RecurringEventPickerComponent } from './recurring-event-chooser/recurring-event-picker.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CustomRecurrenceInputComponent } from './custom-recurrence-input/custom-recurrence-input.component';

@NgModule({
  declarations: [
    AppComponent,
    RecurringEventPickerComponent,
    CustomRecurrenceInputComponent
  ],
  imports: [
    MbscModule,
    BrowserModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
