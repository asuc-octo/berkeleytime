import {
  FetchResult,
  MutationFunction,
  MutationHookOptions,
  MutationResult,
  MutationTuple,
  useMutation,
} from '@apollo/client';
import { useCallback } from 'react';

/**
 * Wraps mutation in a custom hook
 */
export const wrapMutation = <
  Mutation extends unknown,
  MutationVariables extends unknown,
  HookParameters extends any[]
>(
  mutation: (
    options?: MutationHookOptions<Mutation, MutationVariables>
  ) => MutationTuple<Mutation, MutationVariables>,
  callback: (
    ...params: HookParameters
  ) => MutationHookOptions<Mutation, MutationVariables>
) => (
  options?: MutationHookOptions<Mutation, MutationVariables>
): [
  (...params: HookParameters) => Promise<FetchResult<Mutation>>,
  MutationResult<Mutation>
] => {
  const [m, fetchResult] = mutation(options);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const mutationRunner = useCallback(
    (...params: HookParameters) => m(callback(...params)),
    [m]
  );
  return [mutationRunner, fetchResult];
};
