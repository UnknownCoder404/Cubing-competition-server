// Allowed events for competitions
const allowedEvents = [
    "3x3",
    "3x3oh",
    "4x4",
    "2x2",
    "3x3bld",
    "megaminx",
    "teambld",
] as const;

export type AllowedEvent = (typeof allowedEvents)[number];

export default allowedEvents;
