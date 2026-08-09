import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { CredenciaisUsuarioDto } from './dto/credenciais-usuario.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() credenciais: CredenciaisUsuarioDto) {
    return this.authService.login(credenciais);
  }
}
