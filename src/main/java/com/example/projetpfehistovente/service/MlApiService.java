package com.example.projetpfehistovente.service;

import com.example.projetpfehistovente.dto.ml.PredictRequest;
import com.example.projetpfehistovente.dto.ml.PredictResponse;
import com.example.projetpfehistovente.dto.ml.ModelStatusResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MlApiService {

    @Value("${ml.api.url}")
    private String mlApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public PredictResponse predict(PredictRequest request) {
        String url = mlApiUrl + "/predict";
        return restTemplate.postForObject(url, request, PredictResponse.class);
    }

    public ModelStatusResponse getModelStatus() {
        String url = mlApiUrl + "/model/status";
        return restTemplate.getForObject(url, ModelStatusResponse.class);
    }
}
