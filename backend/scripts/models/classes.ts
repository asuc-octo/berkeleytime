import mongoose, { Schema } from "mongoose"
import { paths } from "../common/types/api/classes-schema";

type ClassSuccessResponse = paths["/v1/classes"]["get"]["responses"]["200"]["schema"]["apiResponse"]

const classSchema = new Schema<ClassSuccessResponse>({
	"apiResponse": {
		"correlationId": {
			"type": "String"
		},
		"httpStatus": {
			"code": {
				"type": "Date"
			},
			"description": {
				"type": "String"
			}
		},
		"responseType": {
			"type": "String"
		},
		"response": {
			"classes": {
				"type": [
					"Mixed"
				]
			}
		}
	}
});

const ClassModel = mongoose.model<ClassSuccessResponse>("Class", classSchema);