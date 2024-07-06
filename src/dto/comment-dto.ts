

export class CommentDTO {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;

  constructor(
    id: string,
    content: string,
    commentatorInfo: {
      userId: string;
      userLogin: string;
    },
    createdAt: string,
  ) {
    this.id = id;
    this.content = content;
    this.commentatorInfo = commentatorInfo;
    this.createdAt = createdAt;
  }
}
