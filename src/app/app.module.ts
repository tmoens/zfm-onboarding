import {APP_INITIALIZER, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { StockMigratorComponent } from './stock-migrator/stock-migrator.component';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {HttpClientModule} from '@angular/common/http';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {StockMigratorModule} from './stock-migrator/stock-migrator.module';
import {TopBarComponent } from './top-bar/top-bar.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {RouterModule} from '@angular/router';
import {SplashComponent } from './splash/splash.component';
import {AppRoutingModule} from './app-routing.module';
import {MatSidenavModule} from '@angular/material/sidenav';
import {AppStateService} from './app-state.service';
import {UserMigratorComponent} from './user-migrator/user-migrator/user-migrator.component';
import {UserMigratorModule} from './user-migrator/user-migrator.module';
import {StringMaulingModule} from './string-mauling/string-mauling.module';
import {MatIconModule} from '@angular/material/icon';
import {TgMigratorComponent} from './tg-migrator/tg-migrator/tg-migrator.component';
import {TgMigratorModule} from './tg-migrator/tg-migrator.module';
import {SharedModule} from './shared/shared.module';
import {MutationMigratorComponent} from './mutation-migrator/mutation-migrator/mutation-migrator.component';
import {MutationMigratorModule} from './mutation-migrator/mutation-migrator.module';

export function appStateProviderFactory(provider: AppStateService) {
  return () => provider.initialize();
}

@NgModule({
  declarations: [
    AppComponent,
    StockMigratorComponent,
    UserMigratorComponent,
    TgMigratorComponent,
    MutationMigratorComponent,
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
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    StockMigratorModule,
    MatToolbarModule,
    RouterModule,
    UserMigratorModule,
    TgMigratorModule,
    MutationMigratorModule,
    StringMaulingModule,
    MatIconModule,
    AppRoutingModule,
    SharedModule,
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
