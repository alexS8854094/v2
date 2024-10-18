import { Injectable } from '@angular/core';
import { SQLiteObject } from '@ionic-native/sqlite';
import { AlertController, LoadingController, ModalController, ToastController } from 'ionic-angular';
import { DatePicker } from '@ionic-native/date-picker';

@Injectable()
export class FuncionesProvider {
  db: SQLiteObject = null;
  NombreUsuario: string = '';
  UserID: string = ''; // Agregar el identificador del usuario
  Sociedad: string ='' 

  constructor(
    public alert: AlertController, 
    public loading: LoadingController,
    public toas: ToastController, 
    public modal: ModalController, 
    public date: DatePicker
  ) {}

  AlertasSencillas(titulo: string, mensaje: string) {
    let alert = this.alert.create({
      title: titulo,
      subTitle: mensaje,
      buttons: ['Aceptar']
    });
    alert.present();
  }

  toastSensillo(mensaje: string) {
    let toast = this.toas.create({
      message: mensaje,
      duration: 3500
    });
    toast.present();
  }

  insertarsinalerta(consulta: string) {
    return this.db.executeSql(consulta, [])
      .then(tasks => {
        console.log(consulta);
      })
      .catch(error => {
        console.log("error: " + consulta);
      });
  }

  Seleccionar(consulta: string) {
    return this.db.executeSql(consulta, [])
      .then(response => {
        let registros = [];
        for (let index = 0; index < response.rows.length; index++) {
          registros.push(response.rows.item(index));
        }
        return Promise.resolve(registros);
      })
      .catch(error => Promise.reject(error));
  }

  setUsuario(nombre: string, id: string) { // Método para establecer el usuario
    this.NombreUsuario = nombre;
    this.UserID = id;
  }
}
