import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EditProductPageRoutingModule } from './edit-product-routing.module';
import { EditProductPage } from './edit-product.page';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
  imports: [

    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    IonicModule,
    EditProductPageRoutingModule
  ],
  declarations: [EditProductPage]
})
export class EditProductPageModule { }
