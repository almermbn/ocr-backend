import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Perfil } from './perfil.entity';

@Entity('jogadores')
export class Jogadores {
  @PrimaryGeneratedColumn({ name: 'id_jogador', type: 'integer' })
  idJogador: number;

  @Column({ name: 'nome', type: 'varchar' })
  nome: string;

  @Column({ name: 'login', type: 'varchar', nullable: true })
  login: string;

  @Column({ name: 'senha', type: 'varchar', nullable: true })
  senha: string;

  @ManyToOne(() => Perfil)
  @JoinColumn({
    name: 'id_perfil',
    referencedColumnName: 'idPerfil',
  })
  perfil: Perfil;
}
