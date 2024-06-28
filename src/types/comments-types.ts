export type CommentDbType = {
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  postId: string;
  createdAt: string;
};

export type GetCommentsQuery = {};
