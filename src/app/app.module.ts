import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule } from '@angular/common/http';
import { MAT_DATE_LOCALE } from '@angular/material/core';

import { SharedModule } from 'src/app/shared.module';
import { KeyBoardService } from './services/keyboard.service';

import { registerLocaleData, CurrencyPipe } from '@angular/common';

import localeIn from '@angular/common/locales/en-IN';
import { HomePageModule } from './home/home.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { IonicStorageModule } from '@ionic/storage-angular';

registerLocaleData(localeIn);
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,

    HttpClientModule,
    SharedModule,
    HomePageModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot({
      /* config */
    }),
    AppRoutingModule,
    NgxSkeletonLoaderModule,
    BrowserAnimationsModule,
  ],
  exports: [BrowserModule],
  providers: [
    KeyBoardService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: MAT_DATE_LOCALE, useValue: 'en-IN' },
    CurrencyPipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
