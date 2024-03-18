import { MOVE_DIRECTION } from "./enums/MoveDirection"

export interface MoveEvent {
    direction: MOVE_DIRECTION;
    isKeyDown: boolean;
}