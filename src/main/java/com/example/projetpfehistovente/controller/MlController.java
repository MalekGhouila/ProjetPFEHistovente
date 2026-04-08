package com.example.projetpfehistovente.controller;

import com.example.projetpfehistovente.dto.ml.PredictRequest;
import com.example.projetpfehistovente.dto.ml.PredictResponse;
import com.example.projetpfehistovente.dto.ml.ModelStatusResponse;
import com.example.projetpfehistovente.service.MlApiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ml")
@CrossOrigin(origins = "http://localhost:4200")
public class MlController {

    private final MlApiService mlApiService;

    public MlController(MlApiService mlApiService) {
        this.mlApiService = mlApiService;
    }

    @PostMapping("/predict")
    public ResponseEntity<PredictResponse> predict(@RequestBody PredictRequest request) {
        return ResponseEntity.ok(mlApiService.predict(request));
    }

    @GetMapping("/status")
    public ResponseEntity<ModelStatusResponse> status() {
        return ResponseEntity.ok(mlApiService.getModelStatus());
    }
}
