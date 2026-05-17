package com.example.projetpfehistovente.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/system-status")
    public ResponseEntity<Map<String, String>> getSystemStatus() {
        Map<String, String> status = new LinkedHashMap<>();

        // Database — try to open a real connection
        try (Connection conn = dataSource.getConnection()) {
            status.put("database", "OK");
        } catch (Exception e) {
            status.put("database", "ERROR");
        }

        // API Server — if we reached this line, Spring is running
        status.put("apiServer", "OK");

        // Auth Service — endpoint is JWT-secured, so reaching here means auth works
        status.put("authService", "OK");

        return ResponseEntity.ok(status);
    }
}