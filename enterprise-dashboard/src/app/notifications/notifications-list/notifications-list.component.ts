import { Component, OnInit } from '@angular/core';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html'
})
export class NotificationsListComponent implements OnInit {
  items:any[] = [];
  constructor(private svc: NotificationsService) {}
  ngOnInit() { this.load(); }
  load(){ this.svc.list().subscribe((r:any)=> this.items = r || []); }
}
