package com.example.notificationservice.service;

import com.example.notificationservice.model.NotificationLog;
import com.example.notificationservice.repository.NotificationLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * SMS Service for sending SMS notifications
 * Simulates SMS sending (can be integrated with Twilio, AWS SNS, etc.)
 * Now saves notification logs to MongoDB
 */
@Service
public class SmsService {

    private static final Logger logger = LoggerFactory.getLogger(SmsService.class);

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    /**
     * Send SMS notification
     * In production, integrate with actual SMS provider (Twilio, AWS SNS, etc.)
     */
    public void sendSms(String userId, String message) {
        logger.info("-------------------------------------------");
        logger.info("SMS NOTIFICATION SENT");
        logger.info("To User ID: {}", userId);
        logger.info("Message: {}", message);
        logger.info("-------------------------------------------");

        // Save notification log to MongoDB
        try {
            NotificationLog log = new NotificationLog();
            log.setType("SMS");
            log.setRecipient(userId);
            log.setMessage(message);
            log.setStatus("SENT");
            notificationLogRepository.save(log);
            logger.info("SMS notification log saved to MongoDB");
        } catch (Exception e) {
            logger.error("Error saving SMS notification log: " + e.getMessage());
        }

        // TODO: Integrate with actual SMS service
        // Example with Twilio:
        // Message smsMessage = Message.creator(
        // new PhoneNumber(phoneNumber),
        // new PhoneNumber(twilioNumber),
        // message
        // ).create();
    }
}
