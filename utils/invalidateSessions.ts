import mongoose from "mongoose";

/**
 * Invalidates all sessions for a specific user by deleting them from the sessions collection
 * @param userId - The ID of the user whose sessions should be invalidated
 * @returns A promise that resolves when all sessions are invalidated
 */
export async function invalidateSessions(userId: string): Promise<void> {
    try {
        const sessionsCollection = mongoose.connection.collection("sessions");

        // The session data is stored as a serialized JSON string
        // We need to find all sessions containing this user ID
        // Using a substring pattern to find the user ID in the session data
        await sessionsCollection.deleteMany({
            session: { $regex: `"user":.*"id":"${userId}"` },
        });

        console.log(`All sessions invalidated for user ${userId}`);
    } catch (sessionError) {
        console.error("Error invalidating sessions:", sessionError);
        // Continue execution even if session invalidation fails
    }
}
