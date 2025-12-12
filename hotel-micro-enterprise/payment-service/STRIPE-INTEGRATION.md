# Stripe Payment Integration

## Overview

This payment service integrates **Stripe** - a leading payment processing platform used by millions of businesses worldwide. Stripe is open-source friendly and provides robust APIs for payment processing.

## Features

✅ **Credit/Debit Card Processing** - Visa, Mastercard, Amex, Discover  
✅ **Payment Intents API** - Modern, SCA-compliant payment flow  
✅ **Refund Support** - Full and partial refunds  
✅ **PCI Compliance** - Secure card handling  
✅ **Real-time Processing** - Instant payment confirmation  
✅ **Simulation Mode** - Demo mode for testing without real transactions

## Configuration

### 1. Get Stripe API Keys

1. Sign up at: https://stripe.com (free account)
2. Get your test keys from: https://dashboard.stripe.com/test/apikeys
3. Copy your **Secret Key** (starts with `sk_test_`)
4. Copy your **Publishable Key** (starts with `pk_test_`)

### 2. Configure Environment Variables

**For Production (Linux/Mac):**

```bash
export STRIPE_API_KEY="sk_test_your_secret_key_here"
export STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
```

**For Production (Windows):**

```cmd
setx STRIPE_API_KEY "sk_test_your_secret_key_here"
setx STRIPE_PUBLISHABLE_KEY "pk_test_your_publishable_key_here"
```

**For Development:**
Edit `payment-service/src/main/resources/application.yml`:

```yaml
stripe:
  api:
    key: sk_test_your_secret_key_here
  publishable:
    key: pk_test_your_publishable_key_here
```

### 3. Test Cards

Use these test card numbers in **test mode**:

| Card Number         | Brand      | Result      |
| ------------------- | ---------- | ----------- |
| 4242 4242 4242 4242 | Visa       | ✅ Success  |
| 4000 0000 0000 9995 | Visa       | ❌ Declined |
| 5555 5555 5555 4444 | Mastercard | ✅ Success  |
| 3782 822463 10005   | Amex       | ✅ Success  |

**For all test cards:**

- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (4 for Amex)
- ZIP: Any 5 digits

## Architecture

### Payment Flow

```
┌─────────────────┐
│   Frontend      │
│  (Angular)      │
└────────┬────────┘
         │ 1. Initiate Payment
         ▼
┌─────────────────┐
│  API Gateway    │
│   (Port 8080)   │
└────────┬────────┘
         │ 2. Route Request
         ▼
┌─────────────────────────┐
│   Payment Service       │
│    (Port 8094)          │
│                         │
│  ┌──────────────────┐   │
│  │ PaymentStrategy  │   │
│  │    Interface     │   │
│  └────────┬─────────┘   │
│           │             │
│  ┌────────▼──────────┐  │
│  │ StripeService     │  │
│  │ - Stripe Java SDK │  │
│  │ - Payment Intents │  │
│  │ - Refunds API     │  │
│  └───────────────────┘  │
└────────┬────────────────┘
         │ 3. Process via Stripe
         ▼
┌─────────────────┐
│  Stripe API     │
│  (stripe.com)   │
└────────┬────────┘
         │ 4. Payment Result
         ▼
┌─────────────────┐
│   MongoDB       │
│ (hotel_payments)│
└─────────────────┘
```

## API Endpoints

### Process Payment

```http
POST /api/payments
Content-Type: application/json

{
  "bookingId": "booking-001",
  "userId": "user-001",
  "amount": 299.99,
  "paymentMethod": "STRIPE"
}

Response: 201 Created
{
  "id": "payment-001",
  "transactionId": "pi_1234567890abcdef",
  "status": "COMPLETED",
  "amount": 299.99
}
```

### Create Payment Intent

```http
POST /api/payments/create-intent
Content-Type: application/json

{
  "bookingId": "booking-001",
  "amount": 299.99
}

Response: 200 OK
{
  "clientSecret": "pi_1234_secret_abcd",
  "bookingId": "booking-001",
  "amount": 299.99,
  "currency": "usd"
}
```

### Refund Payment

```http
POST /api/payments/{paymentId}/refund
Content-Type: application/json

{
  "amount": 100.00,
  "reason": "Customer request"
}

Response: 200 OK
{
  "id": "payment-001",
  "status": "PARTIALLY_REFUNDED",
  "refundedAmount": 100.00
}
```

## Implementation Details

### StripeService.java

```java
@Service
public class StripeService {

    // Create Payment Intent
    public PaymentIntent createPaymentIntent(String bookingId, double amount) {
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
            .setAmount((long)(amount * 100)) // Convert to cents
            .setCurrency("usd")
            .addPaymentMethodType("card")
            .putMetadata("booking_id", bookingId)
            .build();

        return PaymentIntent.create(params);
    }

    // Create Refund
    public Refund createRefund(String paymentIntentId, double amount) {
        RefundCreateParams params = RefundCreateParams.builder()
            .setPaymentIntent(paymentIntentId)
            .setAmount((long)(amount * 100))
            .build();

        return Refund.create(params);
    }
}
```

### StripePaymentStrategy.java

```java
@Component("STRIPE")
public class StripePaymentStrategy implements PaymentStrategy {

    @Autowired
    private StripeService stripeService;

    @Override
    public boolean processPayment(Payment payment) {
        // Simulate Stripe payment for demo
        Map<String, Object> result = stripeService.simulatePayment(
            payment.getBookingId(),
            payment.getAmount()
        );

        if (result.get("success").equals(true)) {
            payment.setTransactionId((String) result.get("transactionId"));
            payment.setStatus(PaymentStatus.COMPLETED);
            return true;
        }

        return false;
    }
}
```

## Demo Mode vs Production

### Demo Mode (Current)

- Uses simulated Stripe transactions
- No real API calls to Stripe
- Instant processing with fake transaction IDs
- Perfect for testing and demonstration

### Production Mode

To enable real Stripe processing:

1. **Add Real Stripe Keys:**

   ```yaml
   stripe:
     api:
       key: sk_live_your_real_secret_key
   ```

2. **Update StripePaymentStrategy.java:**

   ```java
   // Replace simulation with real Stripe API calls
   PaymentIntent intent = stripeService.createPaymentIntent(
       payment.getBookingId(),
       payment.getAmount(),
       "usd",
       payment.getUserId()
   );
   ```

3. **Add Webhook Handling:**
   ```java
   @PostMapping("/webhook")
   public ResponseEntity<String> handleStripeWebhook(
       @RequestBody String payload,
       @RequestHeader("Stripe-Signature") String signature) {
       // Handle payment_intent.succeeded event
   }
   ```

## Security Best Practices

✅ **Never expose Secret Keys** - Use environment variables  
✅ **Validate webhook signatures** - Prevent replay attacks  
✅ **Use HTTPS in production** - Encrypt data in transit  
✅ **Implement idempotency** - Prevent duplicate charges  
✅ **Log all transactions** - Audit trail for compliance  
✅ **Handle PCI compliance** - Use Stripe.js for card collection

## Testing

### Unit Tests

```java
@Test
public void testStripePayment() {
    Payment payment = new Payment();
    payment.setBookingId("booking-001");
    payment.setAmount(299.99);

    boolean result = stripeStrategy.processPayment(payment);

    assertTrue(result);
    assertEquals(PaymentStatus.COMPLETED, payment.getStatus());
    assertNotNull(payment.getTransactionId());
}
```

### Integration Tests

```bash
# Start payment service
cd payment-service
mvn spring-boot:run

# Test payment endpoint
curl -X POST http://localhost:8094/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "booking-001",
    "userId": "user-001",
    "amount": 299.99,
    "paymentMethod": "STRIPE"
  }'
```

## Troubleshooting

### Issue: "Stripe API key not set"

**Solution:** Set environment variable or update `application.yml`

### Issue: "Payment failed"

**Solution:** Check logs for Stripe API errors, verify test card numbers

### Issue: "Refund not working"

**Solution:** Ensure payment status is COMPLETED before refunding

## Resources

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Java SDK:** https://github.com/stripe/stripe-java
- **Test Cards:** https://stripe.com/docs/testing
- **API Reference:** https://stripe.com/docs/api
- **Webhooks Guide:** https://stripe.com/docs/webhooks

## Support

For Stripe-related issues:

- Stripe Support: https://support.stripe.com
- Stripe Community: https://github.com/stripe/stripe-java/discussions

For application issues:

- Check logs: `payment-service/logs`
- Review MongoDB: `hotel_payments` collection
- Test endpoints: Postman/curl

## Future Enhancements

🔄 **3D Secure (SCA)** - Enhanced security for EU payments  
🌍 **Multi-currency** - Support for EUR, GBP, etc.  
💰 **Subscriptions** - Recurring billing support  
📱 **Apple Pay / Google Pay** - Mobile wallet integration  
🔔 **Real-time Webhooks** - Instant payment notifications  
📊 **Analytics Dashboard** - Payment metrics and insights

---

**Version:** 1.0.0  
**Last Updated:** December 2025  
**License:** MIT
