import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jogadores } from './entities/jogadores.entity';
import { JogadoresController } from './jogadores.controller';
import { JogadoresService } from './jogadores.service';

@Module({
  imports: [TypeOrmModule.forFeature([Jogadores])],
  controllers: [JogadoresController],
  providers: [JogadoresService],
})
export class JogadoresModule {}
