package com.example.analyticsservice.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsServiceController {

    @GetMapping
    public Map<String, Object> healthCheck() {
        Map<String, Object> res = new HashMap<>();
        res.put("service", "analytics-service");
        res.put("status", "UP");
        res.put("timestamp", new Date());
        return res;
    }

   @PostMapping
    public Map<String, Object> generateReport(@RequestBody Map<String, Object> body) {

        Map<String, Object> report = new HashMap<>();
        report.put("reportName", body.getOrDefault("reportName", "Untitled Report"));
        report.put("reportType", body.getOrDefault("reportType", "Monthly"));
        report.put("startDate", body.getOrDefault("startDate", "N/A"));
        report.put("endDate", body.getOrDefault("endDate", "N/A"));

        report.put("generatedAt", new Date());
        report.put("totalBookings", 12);
        report.put("totalUsers", 25);

        return report;
    }
}
