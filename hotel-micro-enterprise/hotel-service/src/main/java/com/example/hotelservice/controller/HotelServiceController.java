package com.example.hotelservice.controller;

import com.example.hotelservice.model.HotelService;
import com.example.hotelservice.repository.HotelServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "*")
public class HotelServiceController {

    @Autowired
    private HotelServiceRepository serviceRepository;

    /**
     * Get all services (for users - only active)
     */
    @GetMapping
    public ResponseEntity<List<HotelService>> getAllServices() {
        List<HotelService> services = serviceRepository.findByActive(true);
        return ResponseEntity.ok(services);
    }

    /**
     * Get all services including inactive (admin only)
     */
    @GetMapping("/admin/all")
    public ResponseEntity<List<HotelService>> getAllServicesAdmin(
            @RequestHeader(value = "X-User-Role", required = false) String role) {

        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).build();
        }

        List<HotelService> services = serviceRepository.findAll();
        return ResponseEntity.ok(services);
    }

    /**
     * Get service by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<HotelService> getServiceById(@PathVariable String id) {
        Optional<HotelService> service = serviceRepository.findById(id);
        return service.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get services by hotel ID
     */
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<HotelService>> getServicesByHotel(@PathVariable String hotelId) {
        List<HotelService> services = serviceRepository.findByHotelIdsContaining(hotelId);
        return ResponseEntity.ok(services);
    }

    /**
     * Get services by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<HotelService>> getServicesByCategory(@PathVariable String category) {
        List<HotelService> services = serviceRepository.findByCategory(category);
        return ResponseEntity.ok(services);
    }

    /**
     * Create new service (admin only)
     */
    @PostMapping("/admin")
    public ResponseEntity<?> createService(
            @RequestBody HotelService service,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {

        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can create services");
        }

        service.setCreatedBy(userId);
        service.setCreatedAt(LocalDateTime.now());
        service.setActive(true);

        HotelService created = serviceRepository.save(service);
        return ResponseEntity.ok(created);
    }

    /**
     * Update service (admin only)
     */
    @PutMapping("/admin/{id}")
    public ResponseEntity<?> updateService(
            @PathVariable String id,
            @RequestBody HotelService updatedService,
            @RequestHeader(value = "X-User-Role", required = false) String role) {

        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can update services");
        }

        Optional<HotelService> existingOpt = serviceRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        HotelService existing = existingOpt.get();

        // Update fields
        if (updatedService.getName() != null)
            existing.setName(updatedService.getName());
        if (updatedService.getDescription() != null)
            existing.setDescription(updatedService.getDescription());
        if (updatedService.getCategory() != null)
            existing.setCategory(updatedService.getCategory());
        if (updatedService.getPrice() != null)
            existing.setPrice(updatedService.getPrice());
        if (updatedService.getDuration() != null)
            existing.setDuration(updatedService.getDuration());
        if (updatedService.getAvailability() != null)
            existing.setAvailability(updatedService.getAvailability());
        if (updatedService.getTimeSlots() != null)
            existing.setTimeSlots(updatedService.getTimeSlots());
        if (updatedService.getMaxCapacity() != null)
            existing.setMaxCapacity(updatedService.getMaxCapacity());
        if (updatedService.getImageUrl() != null)
            existing.setImageUrl(updatedService.getImageUrl());
        if (updatedService.getActive() != null)
            existing.setActive(updatedService.getActive());
        if (updatedService.getHotelIds() != null)
            existing.setHotelIds(updatedService.getHotelIds());

        existing.setUpdatedAt(LocalDateTime.now());

        HotelService saved = serviceRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    /**
     * Delete service (admin only) - soft delete
     */
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteService(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Role", required = false) String role) {

        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can delete services");
        }

        Optional<HotelService> serviceOpt = serviceRepository.findById(id);
        if (serviceOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        HotelService service = serviceOpt.get();
        service.setActive(false);
        service.setUpdatedAt(LocalDateTime.now());
        serviceRepository.save(service);

        return ResponseEntity.ok("Service deleted successfully");
    }

    /**
     * Hard delete service (admin only) - permanent deletion
     */
    @DeleteMapping("/admin/{id}/permanent")
    public ResponseEntity<?> permanentDeleteService(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Role", required = false) String role) {

        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can permanently delete services");
        }

        if (!serviceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        serviceRepository.deleteById(id);
        return ResponseEntity.ok("Service permanently deleted");
    }
}
