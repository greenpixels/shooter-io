import { MOVE_DIRECTION } from "./enums/MoveDirection"

export interface MoveEvent {
    direction: MOVE_DIRECTION;
    key_down: boolean;
}