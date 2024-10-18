import { Component } from '@angular/core';
import { NavController, AlertController, ToastController, MenuController } from 'ionic-angular';
import { FuncionesProvider } from '../../providers/funciones/funciones';
import { Platform, App } from 'ionic-angular';
import { InicioPage } from '../inicio/inicio';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  user = ""; // Declaración de variable user
  pass = ""; // Declaración de variable pass

  constructor(
    public nav: NavController,
    public forgotCtrl: AlertController, 
    public menu: MenuController, 
    public toastCtrl: ToastController, 
    private fun: FuncionesProvider, 
    public platform: Platform,
    public app: App
  ) {
    this.menu.swipeEnable(false);
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  inicio2(pass, user) {
    const loading = this.fun.loading.create({
      content: "Validando!!!"
    });
    loading.present();

    var LINE_FEED = '\n';
    var CARRIAGE_RETURN = '\r';
    const url = 'http://cep.tresvalles.hn:8004/sap/bc/srt/rfc/sap/zws_validar_usuario_apps/900/zws_validar_usuario_apps/zws_validar_usuario_apps_bn';

    var srt = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
        <soapenv:Header/>
        <soapenv:Body>
          <urn:ZFM_RFC_USER_MBL_XSOC>
            <IMP_ACS></IMP_ACS>
            <IMP_PASS>${pass.value}</IMP_PASS>
            <IMP_USER>${user.value}</IMP_USER>
          </urn:ZFM_RFC_USER_MBL_XSOC>
        </soapenv:Body>
      </soapenv:Envelope>`;

    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState == 4) {
        loading.dismiss();
        if (xmlhttp.status == 200) {
          const parser = new DOMParser();
          const xml = parser.parseFromString(xmlhttp.responseText, 'text/xml');
          const sociedad = xml.getElementsByTagName('EXP_BUKRS').item(0).textContent;
          const Respuesta = xml.getElementsByTagName('EXP_USUARIO').item(0).textContent;

          if (Respuesta.substring(Respuesta.length, Respuesta.length - 1) == '1') {
            let [_, usuario, nombre] = Respuesta.split('|');
            this.fun.setUsuario(nombre.trim(), usuario.trim());
            this.fun.UserID = usuario.trim();
            this.fun.Sociedad = sociedad.trim();
            this.fun.setUsuario(nombre.trim(), usuario.trim());
            this.nav.setRoot(InicioPage);
          } else {
            this.fun.AlertasSencillas('CATV', 'Usuario o contraseña inválidos.');
            this.pass = null;
          }
        } else {
          console.error('Error en la solicitud SOAP:', xmlhttp.status, xmlhttp.statusText, xmlhttp.responseText);
          this.fun.AlertasSencillas('Error', 'Error al obtener las alarmas. Inténtelo nuevamente.');
        }
      }
    };

    xmlhttp.open('POST', url, true);
    xmlhttp.setRequestHeader('Content-Type', 'text/xml;charset=UTF-8');
    xmlhttp.setRequestHeader('Authorization', 'Basic ' + btoa('RFC_USER:Aviones.2018'));
    xmlhttp.timeout = 35000;
    xmlhttp.ontimeout = function () {
      alert("Tiempo de espera agotado");
      loading.dismiss(); 
      xmlhttp.abort();
    };
    xmlhttp.send(srt);
  }

  forgotPass() {
    this.fun.AlertasSencillas('CATV', 'Contactese con el equipo TI CATV');
  }
}
