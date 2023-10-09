import mongoose, { Schema } from "mongoose"
import { paths } from "../common/types/api/classes-schema";

const v1ClassesSuccessResponseObject = {
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
};

const v1ClassesSectionsSuccessResponseObject = {
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
			"classSections": {
				"type": [
					"Mixed"
				]
			}
		}
	}
}

const v1ClassesDescriptorsSuccessResponseObject = {
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
		"response": {
			"fieldValueLists": {
				"type": [
					"Mixed"
				]
			}
		}
	}
};

const v1ClassesSectionsDescriptorsSuccessResponseObject = {}
const v1ClassesEnrollmentByTermSuccessResponseObject = {}
const v1ClassesSectionByIdSuccessResponseObject = {}
const v1ClassesEnrollmentBySectionAndTermSuccessResponseObject = {}


export type v1ClassesSuccessResponse = paths["/v1/classes"]["get"]["responses"]["200"]["schema"]["apiResponse"]
const v1ClassesSuccessSchema = new Schema<v1ClassesSuccessResponse>(v1ClassesSuccessResponseObject);
export const ClassModel = mongoose.model<v1ClassesSuccessResponse>("Class", v1ClassesSuccessSchema);

export type v1ClassesSectionsSuccessResponse = paths["/v1/classes/sections"]["get"]["responses"]["200"]["schema"]["apiResponse"]
const v1ClassesSectionsSuccessSchema = new Schema<v1ClassesSectionsSuccessResponse>(v1ClassesSectionsSuccessResponseObject);
export const ClassSectionModel = mongoose.model<v1ClassesSectionsSuccessResponse>("ClassSection", v1ClassesSectionsSuccessSchema);

export type v1ClassesDescriptorsSuccessResponse = paths["/v1/classes/descriptors"]["get"]["responses"]["200"]["schema"]["apiResponse"]
const v1ClassesDescriptorsSuccessSchema = new Schema<v1ClassesDescriptorsSuccessResponse>(v1ClassesDescriptorsSuccessResponseObject);
export const ClassDescriptorModel = mongoose.model<v1ClassesDescriptorsSuccessResponse>("ClassDescriptor", v1ClassesDescriptorsSuccessSchema);

export type v1ClassesSectionsDescriptorsSuccessResponse = paths["/v1/classes/sections/descriptors"]["get"]["responses"]["200"]["schema"]["apiResponse"]
const v1ClassesSectionsDescriptorsSuccessSchema = new Schema<v1ClassesSectionsDescriptorsSuccessResponse>(v1ClassesSectionsDescriptorsSuccessResponseObject);
export const ClassSectionDescriptorModel = mongoose.model<v1ClassesSectionsDescriptorsSuccessResponse>("ClassSectionDescriptor", v1ClassesSectionsDescriptorsSuccessSchema);

export type v1ClassesEnrollmentByTermSuccessResponse = paths["/v1/classes/sections/terms/{term-id}/updated/enrollments"]["get"]["responses"]["200"]["schema"]["apiResponse"]
const v1ClassesEnrollmentByTermSuccessSchema = new Schema<v1ClassesEnrollmentByTermSuccessResponse>(v1ClassesEnrollmentByTermSuccessResponseObject);
export const ClassEnrollmentByTermModel = mongoose.model<v1ClassesEnrollmentByTermSuccessResponse>("ClassEnrollmentByTerm", v1ClassesEnrollmentByTermSuccessSchema);

export type v1ClassesSectionByIdSuccessResponse = paths["/v1/classes/sections/{class-section-id}"]["get"]["responses"]["200"]["schema"]["apiResponse"]
const v1ClassesSectionByIdSuccessSchema = new Schema<v1ClassesSectionByIdSuccessResponse>(v1ClassesSectionByIdSuccessResponseObject);
export const v1ClassesSectionByIdSuccessModel = mongoose.model<v1ClassesSectionByIdSuccessResponse>("ClassSectionById", v1ClassesSectionByIdSuccessSchema);

export type v1ClassesEnrollmentBySectionAndTermSuccessResponse = paths["/v1/classes/sections/{class-section-id}/term/{term-id}/enrollment"]["get"]["responses"]["200"]["schema"]["apiResponse"]
const v1ClassesEnrollmentBySectionAndTermSuccessSchema = new Schema<v1ClassesEnrollmentBySectionAndTermSuccessResponse>(v1ClassesEnrollmentBySectionAndTermSuccessResponseObject);
export const v1ClassesEnrollmentBySectionAndTermSuccessModel = mongoose.model<v1ClassesEnrollmentBySectionAndTermSuccessResponse>("ClassEnrollmentBySectionAndTerm", v1ClassesEnrollmentBySectionAndTermSuccessSchema);