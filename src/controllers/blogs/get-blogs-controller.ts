import { Response } from 'express';
import { HTTP_STATUSES } from '../../utils/consts';
import { GetBlogListSchema } from '../../Veiw';
import { RequestWithQuery } from '../../types/request-types';
import { GetBlogsQuery } from '../../types/blog-types';
import { queryRepository } from '../../repositories/queryRepository';

export const getBlogsController = async (req: RequestWithQuery<GetBlogsQuery>, res: Response<GetBlogListSchema>) => {
  try {
    const { data } = await queryRepository.getBlogs(req.query);

    res.status(HTTP_STATUSES.OK_200).json(data);
  } catch (e) {
    console.log(e);
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
  }
};
