import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DetalleAlarmaPage } from './detalle-alarma';

@NgModule({
  declarations: [
    DetalleAlarmaPage,
  ],
  imports: [
    IonicPageModule.forChild(DetalleAlarmaPage),
  ],
})
export class DetalleAlarmaPageModule {}
