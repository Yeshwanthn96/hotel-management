package com.example.notificationservice.service;

import com.example.notificationservice.model.NotificationLog;
import com.example.notificationservice.repository.NotificationLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Email Service for sending email notifications
 * Simulates email sending (can be integrated with actual SMTP in production)
 * Now saves notification logs to MongoDB
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    /**
     * Send email notification
     * In production, integrate with actual email provider (SendGrid, AWS SES, etc.)
     */
    public void sendEmail(String toEmail, String subject, String body) {
        logger.info("===========================================");
        logger.info("EMAIL NOTIFICATION SENT");
        logger.info("To: {}", toEmail);
        logger.info("Subject: {}", subject);
        logger.info("Body:\n{}", body);
        logger.info("===========================================");

        // Save notification log to MongoDB
        try {
            NotificationLog log = new NotificationLog();
            log.setType("EMAIL");
            log.setRecipient(toEmail);
            log.setSubject(subject);
            log.setMessage(body);
            log.setStatus("SENT");
            notificationLogRepository.save(log);
            logger.info("Email notification log saved to MongoDB");
        } catch (Exception e) {
            logger.error("Error saving email notification log: " + e.getMessage());
        }

        // TODO: Integrate with actual email service
        // Example with Spring Mail:
        // SimpleMailMessage message = new SimpleMailMessage();
        // message.setTo(toEmail);
        // message.setSubject(subject);
        // message.setText(body);
        // mailSender.send(message);
    }
}
