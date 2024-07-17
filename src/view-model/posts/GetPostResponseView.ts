import { ExtendedLikesInfo } from './ExtendedLikesInfoView';

export type GetPostResponseView = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt?: string;
  extendedLikesInfo: ExtendedLikesInfo
};
