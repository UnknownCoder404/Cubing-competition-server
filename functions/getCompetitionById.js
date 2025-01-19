import { findOne } from "../Models/competition";

async function getCompetitionById(id, fields = null) {
    try {
        if (fields) {
            return await findOne({ _id: { $eq: id } }).select(fields);
        } else {
            return await findOne({ _id: { $eq: id } });
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}
export default { getCompetitionById };
