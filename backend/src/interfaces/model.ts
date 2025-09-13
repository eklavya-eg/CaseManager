import { ModelType } from "../enums/model";

export interface Model {
    id: string;
    name: string;
    type: ModelType;
    createdAt: Date;
    data: FormData;
}