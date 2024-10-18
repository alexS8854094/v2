import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { SQLite } from '@ionic-native/sqlite';
import { DatePicker } from '@ionic-native/date-picker';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { FuncionesProvider } from '../providers/funciones/funciones';
import { InicioPage } from '../pages/inicio/inicio';
import { LoginPage } from '../pages/login/login';
import { DetalleAlarmaPage } from '../pages/detalle-alarma/detalle-alarma';
import { HistorialPage } from '../pages/historial/historial';
import { IonicStorageModule } from '@ionic/storage';


@NgModule({
  declarations: [
    MyApp,    
    InicioPage,
    LoginPage,
    DetalleAlarmaPage,
    HistorialPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    InicioPage,
    LoginPage,
    DetalleAlarmaPage,
    HistorialPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    SQLite,
    DatePicker,
    FuncionesProvider,
   
  ]
})
export class AppModule {}
