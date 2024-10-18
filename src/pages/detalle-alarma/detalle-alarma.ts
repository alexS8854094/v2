import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, LoadingController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FuncionesProvider } from '../../providers/funciones/funciones';
import { InicioPage } from '../inicio/inicio'; // Asegúrate de importar InicioPage

@IonicPage()
@Component({
  selector: 'page-detalle-alarma',
  templateUrl: 'detalle-alarma.html',
})
export class DetalleAlarmaPage {
  alarma: any = {}; // Objeto para almacenar los datos de la alarma
  solucion: string = ''; // Inicializar la variable solución
  verHistorial: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    private menuCtrl: MenuController,
    private fun: FuncionesProvider,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    this.alarma = this.navParams.get('alarma'); // Recibir el objeto completo
    this.verHistorial = this.navParams.get('verHistorial'); // Establecer verHistorial desde los parámetros
    this.solucion = this.alarma.SOLUCION; // Inicializar la solución con la existente si la alarma está resuelta
    this.menuCtrl.enable(true, 'authenticated'); // Habilitar el menú lateral
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DetalleAlarmaPage');
  }

  async enviarSolucion() {
    if (!this.solucion.trim()) {
      this.fun.AlertasSencillas('Error', 'La solución no puede estar vacía.');
      return;
    }

    const fechaApp = new Date();
    this.alarma.SOLUCIONADO = true;
    this.alarma.SOLUCION = this.solucion;
    this.alarma.ENCARGADO = this.fun.UserID; // Usar el identificador del usuario actual
    this.alarma.FECHA_APP = fechaApp.toISOString().substring(0, 10);
    this.alarma.HORA_APP = fechaApp.toISOString().substring(11, 19);

    const loading = this.loadingCtrl.create({
      content: "Enviando solución..."
    });
    loading.present();

    const url = 'http://cep.tresvalles.hn:8004/sap/bc/srt/rfc/sap/zws_rfc_gest_alarmas_fab/900/zws_rfc_gest_alarmas_fab/zws_rfc_gest_alarmas_fab_bn';

    const srt = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
        <soapenv:Header/>
        <soapenv:Body>
          <urn:ZFM_RFC_GEST_ALARMAS_FAB>
            <IMP_OPERACION>1</IMP_OPERACION>
            <IMP_BUKRS>${this.fun.Sociedad}</IMP_BUKRS>
            <TA_ALARMAS>
              <item>
                <MANDT>${this.alarma.MANDT}</MANDT>
                <CORRELATIVO>${this.alarma.CORRELATIVO}</CORRELATIVO>
                <BUKRS>${this.alarma.BUKRS}</BUKRS>
                <FECHA>${this.alarma.FECHA}</FECHA>
                <HORA>${this.alarma.HORA}</HORA>
                <TIPO_ALERTA>${this.alarma.TIPO_ALERTA}</TIPO_ALERTA>
                <VALOR_ALERTA>${this.alarma.VALOR_ALERTA}</VALOR_ALERTA>
                <ENCARGADO>${this.alarma.ENCARGADO}</ENCARGADO>
                <SOLUCIONADO>${this.alarma.SOLUCIONADO ? 'X' : ''}</SOLUCIONADO>
                <SOLUCION>${this.alarma.SOLUCION}</SOLUCION>
                <FECHA_APP>${this.alarma.FECHA_APP}</FECHA_APP>
                <HORA_APP>${this.alarma.HORA_APP}</HORA_APP>
              </item>
            </TA_ALARMAS>
          </urn:ZFM_RFC_GEST_ALARMAS_FAB>
        </soapenv:Body>
      </soapenv:Envelope>`;

    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState == 4) {
        loading.dismiss();
        if (xmlhttp.status == 200) {
          console.log('Solución enviada exitosamente:', xmlhttp.responseText);
          this.actualizarAlarmaLocal();
        } else {
          console.error('Error en la solicitud SOAP:', xmlhttp.status, xmlhttp.statusText, xmlhttp.responseText);
          this.fun.AlertasSencillas('Error', 'Error al enviar la solución. Inténtelo nuevamente.');
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

  async actualizarAlarmaLocal() {
    let historial = await this.storage.get('historial');
    if (!historial) {
      historial = [];
    }
    historial.push({
      ...this.alarma,
      fechaRegistro: new Date().toISOString()
    });
    await this.storage.set('historial', historial);

    console.log(`Solución para la alarma ${this.alarma.CORRELATIVO} enviada: ${this.alarma.SOLUCION}`);
    await this.marcarAlarmaComoResuelta(this.alarma.CORRELATIVO);
    this.navCtrl.pop();
  }

  async marcarAlarmaComoResuelta(alarmaId: number) {
    const inicioPage = this.navCtrl.getPrevious().instance as InicioPage;
    await inicioPage.marcarAlarmaComoResuelta(alarmaId);
  }
}
