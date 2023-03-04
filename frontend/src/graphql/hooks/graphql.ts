import {
	FetchResult,
	LazyQueryHookOptions,
	LazyQueryResult,
	MutationHookOptions,
	MutationResult,
	MutationTuple,
	QueryTuple,
	OperationVariables
} from '@apollo/client';
import { useCallback } from 'react';

/**
 * Wraps mutation in a custom hook
 */
export const wrapMutation =
	<Mutation extends unknown, MutationVariables extends unknown, HookParameters extends any[]>(
		mutation: (
			options?: MutationHookOptions<Mutation, MutationVariables>
		) => MutationTuple<Mutation, MutationVariables>,
		callback: (...params: HookParameters) => MutationHookOptions<Mutation, MutationVariables>
	) =>
	(
		options?: MutationHookOptions<Mutation, MutationVariables>
	): [(...params: HookParameters) => Promise<FetchResult<Mutation>>, MutationResult<Mutation>] => {
		const [m, fetchResult] = mutation(options);
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const mutationRunner = useCallback((...params: HookParameters) => m(callback(...params)), [m]);
		return [mutationRunner, fetchResult];
	};

/**
 * Wraps mutation in a custom hook
 */
export const wrapLazyQuery =
	<
		LazyQuery extends unknown,
		LazyQueryVariables extends OperationVariables,
		HookParameters extends any[]
	>(
		lazyQuery: (
			options?: LazyQueryHookOptions<LazyQuery, LazyQueryVariables>
		) => QueryTuple<LazyQuery, LazyQueryVariables>,
		callback: (...params: HookParameters) => LazyQueryHookOptions<LazyQuery, LazyQueryVariables>
	) =>
	(
		options?: LazyQueryHookOptions<LazyQuery, LazyQueryVariables>
	): [(...params: HookParameters) => void, LazyQueryResult<LazyQuery, LazyQueryVariables>] => {
		const [m, fetchResult] = lazyQuery(options);
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const queryRunner = useCallback((...params: HookParameters) => m(callback(...params)), [m]);
		return [queryRunner, fetchResult];
	};
