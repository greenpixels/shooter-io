import { EventInformationType } from "../enums/EventInformationType"

export interface EventInformationDTO<T> {
    type: EventInformationType
    payload: {[key: string] : T}
}