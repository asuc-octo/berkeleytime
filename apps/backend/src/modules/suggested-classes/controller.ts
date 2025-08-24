import { PostModel, UserType } from "@repo/common";

import {
  CreatePostInput,
  UpdatePostInput,
} from "../../generated-types/graphql";

export const getPosts = async () => {
  return await PostModel.find();
};

export const getPost = async (id: string) => {
  const post = await PostModel.findOne({
    _id: id,
  });

  if (!post) throw new Error("Not found");

  return post;
};

export const updatePost = async (
  context: { user?: UserType },
  id: string,
  input: UpdatePostInput
) => {
  if (!context.user?.staff) throw new Error("Unauthorized");

  const post = await PostModel.findOneAndUpdate(
    {
      _id: id,
    },
    input,
    { new: true }
  );
  if (!post) throw new Error("Not found");

  return post;
};

export const deletePost = async (context: { user?: UserType }, id: string) => {
  if (!context.user?.staff) throw new Error("Unauthorized");

  const post = await PostModel.findOneAndDelete({
    _id: id,
  });
  if (!post) throw new Error("Not Found");

  return true;
};

export const createPost = async (
  context: { user?: UserType },
  input: CreatePostInput
) => {
  if (!context.user?.staff) throw new Error("Unauthorized");

  const post = await PostModel.create({
    ...input,
    createdBy: context.user._id,
  });

  return post;
};
