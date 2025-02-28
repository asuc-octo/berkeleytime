export const formatPost = (post:any) => ({
    userId: post.userId.toString(),
    PostTime: post.PostTime.toISOString(),
    PostContent: post.PostContent,
});
