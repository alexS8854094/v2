import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, LoadingController, AlertController } from 'ionic-angular';
import { FuncionesProvider } from '../../providers/funciones/funciones';
import { DetalleAlarmaPage } from '../detalle-alarma/detalle-alarma';

@IonicPage()
@Component({
  selector: 'page-historial',
  templateUrl: 'historial.html',
})
export class HistorialPage {
  historialFiltrado: any[] = [];
  fechaInicio: string;
  fechaFin: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private menuCtrl: MenuController, private fun: FuncionesProvider, private loadingCtrl: LoadingController, private alertCtrl: AlertController) {
    this.menuCtrl.enable(true, 'authenticated'); // Habilitar el menú lateral
    const today = new Date().toISOString().substring(0, 10);
    this.fechaInicio = new Date().toISOString().substring(0, 10);
    this.fechaFin = new Date().toISOString().substring(0, 10);
  }

  ionViewDidLoad() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    // Esta función puede permanecer vacía si no cargamos el historial localmente al inicio
  }

  buscarAlarmas() {
    const loading = this.loadingCtrl.create({
      content: "Buscando alarmas..."
    });
    loading.present();
    
  

    const url = 'http://cep.tresvalles.hn:8004/sap/bc/srt/rfc/sap/zws_rfc_gest_alarmas_fab/900/zws_rfc_gest_alarmas_fab/zws_rfc_gest_alarmas_fab_bn';

    const srt = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
        <soapenv:Header/>
        <soapenv:Body>
          <urn:ZFM_RFC_GEST_ALARMAS_FAB>
            <IMP_OPERACION>3</IMP_OPERACION>
            <IMP_BUKRS>${this.fun.Sociedad}</IMP_BUKRS>
            <IMP_FECHAI>${this.fechaInicio}</IMP_FECHAI>
            <IMP_FECHAF>${this.fechaFin}</IMP_FECHAF>
            <TA_ALARMAS>
            </TA_ALARMAS>
          </urn:ZFM_RFC_GEST_ALARMAS_FAB>
        </soapenv:Body>
      </soapenv:Envelope>`;

    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState == 4) {
        loading.dismiss();
        if (xmlhttp.status == 200) {
          const parser = new DOMParser();
          const xml = parser.parseFromString(xmlhttp.responseText, 'text/xml');
          const items = xml.getElementsByTagName('item');

          this.historialFiltrado = [];

          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const alarma = {
              MANDT: item.getElementsByTagName('MANDT')[0].textContent,
              CORRELATIVO: item.getElementsByTagName('CORRELATIVO')[0].textContent,
              BUKRS: item.getElementsByTagName('BUKRS')[0].textContent,
              FECHA: item.getElementsByTagName('FECHA')[0].textContent,
              HORA: item.getElementsByTagName('HORA')[0].textContent,
              DEPT: item.getElementsByTagName('DEPT')[0] ? item.getElementsByTagName('DEPT')[0].textContent : '',
              TIPO_ALERTA: item.getElementsByTagName('TIPO_ALERTA')[0].textContent,
              DEPTID: item.getElementsByTagName('DEPTID')[0] ? item.getElementsByTagName('DEPTID')[0].textContent : '',
              VALOR_ALERTA: item.getElementsByTagName('VALOR_ALERTA')[0].textContent,
              ENCARGADO: item.getElementsByTagName('ENCARGADO')[0].textContent,
              SOLUCIONADO: item.getElementsByTagName('SOLUCIONADO')[0].textContent === 'true',
              SOLUCION: item.getElementsByTagName('SOLUCION')[0].textContent,
              FECHA_APP: item.getElementsByTagName('FECHA_APP')[0] ? item.getElementsByTagName('FECHA_APP')[0].textContent : '',
              HORA_APP: item.getElementsByTagName('HORA_APP')[0] ? item.getElementsByTagName('HORA_APP')[0].textContent : ''
            };
            this.historialFiltrado.push(alarma);
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

  editarFechaInicio() {
    this.fun.date.show({
      date: new Date(),
      mode: 'date',
      androidTheme: this.fun.date.ANDROID_THEMES.THEME_HOLO_LIGHT
    }).then(
      date => this.fechaInicio = date.toISOString().substring(0, 10),
      err => console.log('Error occurred while getting date: ', err)
    );
  }

  editarFechaFin() {
    this.fun.date.show({
      date: new Date(),
      mode: 'date',
      androidTheme: this.fun.date.ANDROID_THEMES.THEME_HOLO_LIGHT
    }).then(
      date => this.fechaFin = date.toISOString().substring(0, 10),
      err => console.log('Error occurred while getting date: ', err)
    );
  }

  verDetalleAlarma(alarma: any) {
    this.navCtrl.push(DetalleAlarmaPage, { alarma: alarma, verHistorial: true });
  }
}
