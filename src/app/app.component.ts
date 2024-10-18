import { Component, ViewChild } from '@angular/core';
import { Platform, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { InicioPage } from '../pages/inicio/inicio';
import { LoginPage } from '../pages/login/login';
import { HistorialPage } from '../pages/historial/historial';
import { FuncionesProvider } from '../providers/funciones/funciones';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage:any = LoginPage;

  appMenuItems: Array<{title: string, component: any, icon: string}>;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public fun: FuncionesProvider) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
    });

    this.appMenuItems = [
      {title: 'Inicio', component: InicioPage, icon: 'home'},
      {title: 'Historial', component: HistorialPage, icon: 'archive'},
      // Puedes agregar más elementos del menú aquí
    ];
  }

  openPage(menuItem) {
    this.nav.setRoot(menuItem.component);
  }

  exit() {
    this.nav.setRoot(LoginPage);
  }
}
