import { Component } from '@angular/core';
import { NavController, NavParams, MenuController, LoadingController, AlertController } from 'ionic-angular';
import { FuncionesProvider } from '../../providers/funciones/funciones';
import { DetalleAlarmaPage } from '../detalle-alarma/detalle-alarma';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-inicio',
  templateUrl: 'inicio.html',
})
export class InicioPage {
  alarmas = [];
  alarmasPendientes: number = 0; // Contador de alarmas pendientes

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private fun: FuncionesProvider,
    private menuCtrl: MenuController,
    private storage: Storage,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    this.menuCtrl.enable(true, 'authenticated'); // Habilitar el menú lateral
    this.cargarAlarmas(); // Cargar alarmas al inicializar
  }

  cargarAlarmas() {
    const loading = this.loadingCtrl.create({
      content: "Cargando alarmas..."
    });
    loading.present();
    
    const url = 'http://cep.tresvalles.hn:8004/sap/bc/srt/rfc/sap/zws_rfc_gest_alarmas_fab/900/zws_rfc_gest_alarmas_fab/zws_rfc_gest_alarmas_fab_bn';

    var srt = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">' +
      '<soapenv:Header/>' +
      '<soapenv:Body>' +
        '<urn:ZFM_RFC_GEST_ALARMAS_FAB>' +
         '<IMP_OPERACION>0</IMP_OPERACION>' +
         '<IMP_BUKRS>'+ this.fun.Sociedad +'</IMP_BUKRS>'+
         '<TA_ALARMAS>' +
         '</TA_ALARMAS>' +
        '</urn:ZFM_RFC_GEST_ALARMAS_FAB>' +
      '</soapenv:Body>' +
    '</soapenv:Envelope>';

    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState == 4) {
        loading.dismiss();
        if (xmlhttp.status == 200) {
          const parser = new DOMParser();
          const xml = parser.parseFromString(xmlhttp.responseText, 'text/xml');
          const items = xml.getElementsByTagName('item');

          this.alarmas = [];

          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const alarma = {
              MANDT: item.getElementsByTagName('MANDT')[0].textContent,
              CORRELATIVO: item.getElementsByTagName('CORRELATIVO')[0].textContent,
              BUKRS: item.getElementsByTagName('BUKRS')[0].textContent,
              FECHA: item.getElementsByTagName('FECHA')[0].textContent,
              HORA: item.getElementsByTagName('HORA')[0].textContent,
              TIPO_ALERTA: item.getElementsByTagName('TIPO_ALERTA')[0].textContent,
              DEPT: item.getElementsByTagName('DEPT')[0] ? item.getElementsByTagName('DEPT')[0].textContent : '',
              VALOR_ALERTA: item.getElementsByTagName('VALOR_ALERTA')[0].textContent,
              DEPTID: item.getElementsByTagName('DEPTID')[0] ? item.getElementsByTagName('DEPTID')[0].textContent : '',
              ENCARGADO: item.getElementsByTagName('ENCARGADO')[0].textContent,
              SOLUCIONADO: item.getElementsByTagName('SOLUCIONADO')[0].textContent === 'true',
              SOLUCION: item.getElementsByTagName('SOLUCION')[0].textContent,
              FECHA_APP: item.getElementsByTagName('FECHA_APP')[0] ? item.getElementsByTagName('FECHA_APP')[0].textContent : '',
              HORA_APP: item.getElementsByTagName('HORA_APP')[0] ? item.getElementsByTagName('HORA_APP')[0].textContent : ''
            };
           
          
          
         
            this.alarmas.push(alarma);
          }

          this.alarmasPendientes = this.alarmas.filter(alarma => !alarma.SOLUCIONADO).length; // Contar alarmas pendientes
          this.storage.set('alarmas', this.alarmas);
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

  goToAlarma(alarma: any) {
    this.navCtrl.push(DetalleAlarmaPage, { alarma: alarma, verHistorial: false });
  }

  refrescar() {
    this.cargarAlarmas();
  }

  async marcarAlarmaComoResuelta(alarmaId: number) {
    const index = this.alarmas.findIndex(a => a.CORRELATIVO == alarmaId);
    if (index !== -1) {
      this.alarmas.splice(index, 1);
      await this.storage.set('alarmas', this.alarmas); // Guardar el estado actualizado de las alarmas
      this.alarmasPendientes = this.alarmas.filter(alarma => !alarma.SOLUCIONADO).length; // Actualizar contador de alarmas pendientes
    }
  }
}
