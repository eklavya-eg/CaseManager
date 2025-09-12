enum ModelType {
    CLASSIFICATION = "classification",
    ANOMALY_DETECTION = "anomaly_detection"
}

export interface Model {
    id: string;
    name: string;
    type: ModelType;
    createdAt: Date;
    data: FormData;
}