import mongoose, { Schema } from "mongoose"
import { paths } from "../common/types/api/classes-schema";

type v1ClassesSuccessResponse = paths["/v1/classes"]["get"]["responses"]["200"]["schema"]["apiResponse"]

const classSchema = new Schema<v1ClassesSuccessResponse>({
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

export const ClassModel = mongoose.model<v1ClassesSuccessResponse>("Class", classSchema);

type v1ClassesDescriptorsSuccessResponse = paths["/v1/classes/descriptors"]["get"]["responses"]["200"]["schema"]["apiResponse"]
type v1ClassesSectionsSuccessResponse = paths["/v1/classes/sections"]["get"]["responses"]["200"]["schema"]["apiResponse"]
type v1ClassesSectionsDescriptorsSuccessResponse = paths["/v1/classes/sections/descriptors"]["get"]["responses"]["200"]["schema"]["apiResponse"]
type v1ClassesEnrollmentByTermSuccessResponse = paths["/v1/classes/sections/terms/{term-id}/updated/enrollments"]["get"]["responses"]["200"]["schema"]["apiResponse"]
type v1ClassesSectionByIdSuccessResponse = paths["/v1/classes/sections/{class-section-id}"]["get"]["responses"]["200"]["schema"]["apiResponse"]
type v1ClassesEnrollmentBySectionAndTermSuccessResponse = paths["/v1/classes/sections/{class-section-id}/term/{term-id}/enrollment"]["get"]["responses"]["200"]["schema"]["apiResponse"]