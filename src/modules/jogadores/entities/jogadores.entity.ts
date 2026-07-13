import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('jogadores')
export class Jogadores {
  @PrimaryGeneratedColumn({ name: 'id_jogador', type: 'integer' })
  idJogador: number;

  @Column({ name: 'nome', type: 'varchar', length: 100 })
  nome: string;
}
