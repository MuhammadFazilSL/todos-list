import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserPayload {
  uid: string;
  email: string;
  displayName: string;
}

export const GetUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserPayload;
    return data ? user?.[data] : user;
  },
);
