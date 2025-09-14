export function formatDiscussion(discussion: any) {
    return {
        id: discussion._id.toString(),
        content: discussion.content,
        author: discussion.author,
        createdAt: discussion.createdAt.toISOString(),
        classId: discussion.classId
    };
}

export function formatDiscussions(discussions: any[]) {
    return discussions.map(formatDiscussion);
}