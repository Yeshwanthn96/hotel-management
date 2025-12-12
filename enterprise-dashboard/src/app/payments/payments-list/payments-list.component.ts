import { Component, OnInit } from '@angular/core';
import { PaymentsService, Payment } from '../../services/payments.service';

@Component({
  selector: 'app-payments-list',
  templateUrl: './payments-list.component.html'
})
export class PaymentsListComponent implements OnInit {
  payments: Payment[] = [];
  
  constructor(private svc: PaymentsService) {}
  
  ngOnInit() {
    this.load();
  }
  
  load() {
    this.svc.getAllPayments().subscribe(data => this.payments = data);
  }
}
