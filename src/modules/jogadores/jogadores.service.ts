import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
