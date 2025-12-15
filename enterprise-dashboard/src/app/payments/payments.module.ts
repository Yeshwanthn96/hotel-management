import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentsRoutingModule } from './payments-routing.module';
import { PaymentsListComponent } from './payments-list/payments-list.component';
import { PaymentsAddComponent } from './payments-add/payments-add.component';
import { UserPaymentsComponent } from './user-payments/user-payments.component';
import { PaymentDetailsComponent } from './payment-details/payment-details.component';

@NgModule({
  declarations: [PaymentsListComponent, PaymentsAddComponent, UserPaymentsComponent, PaymentDetailsComponent],
  imports: [CommonModule, FormsModule, PaymentsRoutingModule]
})
export class PaymentsModule {}
