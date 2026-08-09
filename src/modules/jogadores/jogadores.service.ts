import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CriarJogadorDto } from './dto/criar-jogador.dto';
import { Jogadores } from './entities/jogadores.entity';

@Injectable()
export class JogadoresService {
  constructor(
    @InjectRepository(Jogadores)
    private readonly jogadoresRepository: Repository<Jogadores>,
  ) {}
  async listarJogadores(): Promise<Jogadores[]> {
    return this.jogadoresRepository.find();
  }

  async criarJogador(dto: CriarJogadorDto): Promise<Omit<Jogadores, 'senha'>> {
    const existente = await this.jogadoresRepository.findOne({
      where: { login: dto.login },
    });
    if (existente) {
      throw new ConflictException('Login já cadastrado');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);
    const jogador = this.jogadoresRepository.create({
      nome: dto.nome,
      login: dto.login,
      senha: senhaHash,
    });
    const salvo = await this.jogadoresRepository.save(jogador);

    return {
      idJogador: salvo.idJogador,
      nome: salvo.nome,
      login: salvo.login,
      perfil: salvo.perfil,
    };
  }
}
