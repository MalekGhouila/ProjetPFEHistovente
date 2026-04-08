package com.example.projetpfehistovente.dto.ml;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class ModelStatusResponse {
    private String status;

    @JsonProperty("model_name")
    private String modelName;

    private double wmape;
    private double r2;

    @JsonProperty("last_trained")
    private String lastTrained;

    @JsonProperty("families_supported")
    private List<String> familiesSupported;
}
