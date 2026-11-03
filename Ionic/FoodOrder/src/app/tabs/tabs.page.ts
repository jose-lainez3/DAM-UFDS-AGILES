
import { Component, inject } from '@angular/core';

import {
  IonBadge,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  cartOutline,
  personCircleOutline,
  receiptOutline,
  restaurantOutline
} from 'ionicons/icons';

import { CartService } from '../core/cart.service';

@Component({
  selector: 'app-tabs',
  standalone: true,

  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],

  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonBadge
  ]
})
export class TabsPage {

  cart = inject(CartService);

  constructor() {
    addIcons({
      restaurantOutline,
      cartOutline,
      receiptOutline,
      personCircleOutline
    });
  }
}
