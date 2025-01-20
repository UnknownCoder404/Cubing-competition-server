import Competition from "../Models/competition";

export async function getCompetitionById(id: string, fields = null) {
    try {
        if (fields) {
            return await Competition.findOne({ _id: { $eq: id } }).select(
                fields,
            );
        } else {
            return await Competition.findOne({ _id: { $eq: id } });
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}
