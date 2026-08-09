import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { UsuarioPayload } from '../dto/usuario-payload.dto';

export const Usuario = createParamDecorator(
  (data: keyof UsuarioPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: UsuarioPayload }>();
    const usuario = request.user;
    return data ? usuario?.[data] : usuario;
  },
);
