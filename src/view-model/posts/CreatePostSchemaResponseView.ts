import { ExtendedLikesInfo } from './ExtendedLikesInfoView';

export type CreatePostSchemaResponseView = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfo
};
