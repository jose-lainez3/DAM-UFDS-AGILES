import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { FoodOrderUpdateService } from './core/foodorder-update.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private readonly updates = inject(FoodOrderUpdateService);

  constructor() {
    void this.updates.initialize();
  }
}
