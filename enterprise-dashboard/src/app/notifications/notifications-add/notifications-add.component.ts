import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-notifications-add',
  templateUrl: './notifications-add.component.html'
})
export class NotificationsAddComponent {
  name = '';
  constructor(private svc: NotificationsService, private router: Router) {}
  save(){ this.svc.add({name:this.name}).subscribe(()=> this.router.navigate(['/notifications'])); }
}
