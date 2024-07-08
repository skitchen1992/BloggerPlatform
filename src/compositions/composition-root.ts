import { AuthController } from '../controllers/auth-controller';
import { AuthService } from '../services/auth-service';
import { UserRepository } from '../repositories/user-repository';
import { EmailService } from '../services/email-service';
import { UserService } from '../services/user-service';
import { SETTINGS } from '../utils/settings';
import { JwtService } from '../services/jwt-service';
import { MailerService } from '../services/mailer-service';
import { BlogRepository } from '../repositories/blog-repository';
import { CommentRepository } from '../repositories/comment-repository';
import { PostRepository } from '../repositories/post-repository';
import { SessionRepository } from '../repositories/session-repository';
import { VisitRepository } from '../repositories/visit-repository';
import { BlogService } from '../services/blog-service';
import { CommentService } from '../services/comment-service';
import { DeviceService } from '../services/devise-service';
import { PostService } from '../services/post-service';
import { VisitService } from '../services/visit-service';
import { BlogController } from '../controllers/blog-controller';
import { CommentController } from '../controllers/comment-controller';
import { PostController } from '../controllers/post-controller';
import { SecurityController } from '../controllers/device-controller';
import { UserController } from '../controllers/user-controller';
import { LikeService } from '../services/like-service';
import { LikeRepository } from '../repositories/like-repository';

export const mailerService = new MailerService();
export const emailService = new EmailService(mailerService);
export const jwtService = new JwtService(SETTINGS.JWT_SECRET_KEY!);


export const userRepository = new UserRepository();
export const blogRepository = new BlogRepository();
export const commentRepository = new CommentRepository();
export const postRepository = new PostRepository();
export const sessionRepository = new SessionRepository();
export const visitRepository = new VisitRepository();
export const likeRepository = new LikeRepository();


export const authService = new AuthService(
  userRepository,
  jwtService,
  emailService,
  sessionRepository);
export const userService = new UserService(userRepository);
export const blogService = new BlogService(blogRepository);
export const commentService = new CommentService(commentRepository);
export const deviseService = new DeviceService(jwtService, sessionRepository);
export const postService = new PostService(blogRepository, postRepository);
export const visitService = new VisitService(visitRepository);
export const likeService = new LikeService(likeRepository);

export const authController = new AuthController(
  authService,
  userRepository,
  userService,
  emailService,
  jwtService,
);

export const blogController = new BlogController(
  blogRepository,
  blogService,
  postRepository,
  postService,
);

export const commentController = new CommentController(
  commentService,
  commentRepository,
  likeService,
);

export const postController = new PostController(
  postRepository,
  postService,
  commentRepository,
  commentService,
);

export const securityController = new SecurityController(
  jwtService,
  sessionRepository,
  deviseService,
);

export const userController = new UserController(
  userRepository,
  userService,
);
