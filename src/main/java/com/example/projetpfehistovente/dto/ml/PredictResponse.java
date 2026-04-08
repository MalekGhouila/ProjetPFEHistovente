package com.example.projetpfehistovente.dto.ml;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class PredictResponse {
    private String famille;
    private int year;

    @JsonProperty("week_of_year")
    private int weekOfYear;

    @JsonProperty("predicted_quantity")
    private double predictedQuantity;
}
