import {
	AdTargetRequestContext,
	CreateAdTargetInput,
	UpdateAdTargetInput,
	createAdTarget,
	deleteAdTarget,
	getAllAdTargets,
	updateAdTarget,
} from "./controller";

const resolvers = {
	Query: {
		allAdTargets: () => getAllAdTargets(),
	},

	Mutation: {
		createAdTarget: (
			_: unknown,
			{ input }: { input: CreateAdTargetInput },
			context: AdTargetRequestContext
		) => createAdTarget(context, input),
		updateAdTarget: (
			_: unknown,
			{ adTargetId, input }: { adTargetId: string; input: UpdateAdTargetInput },
			context: AdTargetRequestContext
		) => updateAdTarget(context, adTargetId, input),
		deleteAdTarget: (
			_: unknown,
			{ adTargetId }: { adTargetId: string },
			context: AdTargetRequestContext
		) => deleteAdTarget(context, adTargetId),
	},

	AdTarget: {
		id: (parent: { _id?: { toString: () => string }; id?: string }) =>
			parent._id?.toString() ?? parent.id,
	},
};

export default resolvers;

