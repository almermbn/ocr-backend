import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { LoginRespostaDto } from 'src/openai/types';
import { Repository } from 'typeorm';
import { Jogadores } from '../jogadores/entities/jogadores.entity';
import { CredenciaisUsuarioDto } from './dto/credenciais-usuario.dto';
import { UsuarioPayload } from './dto/usuario-payload.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Jogadores)
    private readonly jogadoresRepository: Repository<Jogadores>,
    private readonly jwtService: JwtService,
  ) {}

  async login(credenciais: CredenciaisUsuarioDto): Promise<LoginRespostaDto> {
    const jogador = await this.jogadoresRepository.findOne({
      where: { login: credenciais.login },
      relations: {
        perfil: true,
      },
    });

    if (!jogador || !jogador.senha) {
      throw new UnauthorizedException('Login ou senha inválidos');
    }

    const senhaValida = await bcrypt.compare(credenciais.senha, jogador.senha);
    if (!senhaValida) {
      throw new UnauthorizedException('Login ou senha inválidos');
    }

    const payload: UsuarioPayload = {
      idJogador: jogador.idJogador,
      nome: jogador.nome,
      login: jogador.login,
    };

    return {
      token: await this.jwtService.signAsync(payload),
      usuario: jogador,
    };
  }

  static async hashSenha(senha: string): Promise<string> {
    return bcrypt.hash(senha, 10);
  }
}
