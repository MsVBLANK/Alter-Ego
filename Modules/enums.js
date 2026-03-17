/** @enum {number} */
export const MessageDisplayType = {
    STANDARD: 0,
	WARNING: 1,
    ALERT: 2,
    MINOR: 3,
    PLAYER: 4,
    MONOLOG: 5,
    PLAIN_TEXT: 6
};

/** @enum {number} */
export const InteractableType = {
    BUTTON: 0,
    STRING_SELECT_MENU: 1,
    STRING_SELECT_MENU_OPTION: 2,
    MODAL: 3,
    TEXT_INPUT: 4
};

/** @enum {number} */
export const ActionPriority = {
    VIEW_FIELD: 1,
    VIEW: 2,
    INSTANTIATE: 3,
    DESTROY: 4,
    QUEUE_MOVE: 7,
    QUEUE_RUN: 8,
    STASH: 10,
    UNSTASH: 11,
    INSPECT: 12,
    TAKE: 20,
    CRAFT: 21,
    EQUIP: 25,
    USE: 30,
    UNEQUIP: 35,
    DROP: 40
};
