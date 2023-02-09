import {APP_INITIALIZER, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { StockMigratorComponent } from './stock-migrator/stock-migrator.component';
import {MatCardModule} from '@angular/material/card';
import {HttpClientModule} from '@angular/common/http';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatListModule} from '@angular/material/list';
import {FlexModule} from '@angular/flex-layout';
import {MatInputModule} from '@angular/material/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {StockMigratorModule} from './stock-migrator/stock-migrator.module';
import {TopBarComponent } from './top-bar/top-bar.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {RouterModule} from '@angular/router';
import {SplashComponent } from './splash/splash.component';
import {AppRoutingModule} from './app-routing.module';
import {MatSidenavModule} from '@angular/material/sidenav';
import {AppStateService} from './app-state.service';
import {UserMigratorComponent} from './user-migrator/user-migrator.component';
import {UserMigratorModule} from './user-migrator/user-migrator.module';
import {StringMaulingModule} from './string-mauling/string-mauling.module';
import {MatIconModule} from '@angular/material/icon';
import {TgMigratorComponent} from './tg-migrator/tg-migrator/tg-migrator.component';
import {TgMigratorModule} from './tg-migrator/tg-migrator.module';

export function appStateProviderFactory(provider: AppStateService) {
  return () => provider.initialize();
}

@NgModule({
  declarations: [
    AppComponent,
    StockMigratorComponent,
    UserMigratorComponent,
    TgMigratorComponent,
    TopBarComponent,
    SplashComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSidenavModule,
    MatListModule,
    FlexModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    StockMigratorModule,
    MatToolbarModule,
    RouterModule,
    UserMigratorModule,
    TgMigratorModule,
    StringMaulingModule,
    MatIconModule,
    AppRoutingModule,
  ],
  providers: [
    {provide: APP_INITIALIZER,
      useFactory: appStateProviderFactory,
      deps: [AppStateService],
      multi: true,
    },
  ],
  exports: [
    TopBarComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
