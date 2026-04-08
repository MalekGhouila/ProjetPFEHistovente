package com.example.projetpfehistovente.dto.ml;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class PredictRequest {
    private String famille;
    private int year;

    @JsonProperty("week_of_year")
    @JsonAlias({"weekOfYear", "week_of_year"})
    private int weekOfYear;

    @JsonProperty("lag_1")
    @JsonAlias({"lag1", "lag_1"})
    private double lag1;

    @JsonProperty("lag_2")
    @JsonAlias({"lag2", "lag_2"})
    private double lag2;

    @JsonProperty("lag_4")
    @JsonAlias({"lag4", "lag_4"})
    private double lag4;

    @JsonProperty("lag_52")
    @JsonAlias({"lag52", "lag_52"})
    private double lag52;

    @JsonProperty("rolling_mean_4")
    @JsonAlias({"rollingMean4", "rolling_mean_4"})
    private double rollingMean4;

    @JsonProperty("rolling_mean_12")
    @JsonAlias({"rollingMean12", "rolling_mean_12"})
    private double rollingMean12;
}
