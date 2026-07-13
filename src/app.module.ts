import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JogadoresModule } from './modules/jogadores/jogadores.module';
import { ParticipantesTorneioModule } from './modules/participantes-torneio/participantes-torneio.module';
import { PartidasModule } from './modules/partidas/partidas.module';
import { TorneiosModule } from './modules/torneios/torneios.module';
import { OcrModule } from './ocr/ocr.module';
import { OpenaiModule } from './openai/openai.module';

const databaseImports =
  process.env.NODE_ENV === 'test'
    ? []
    : [
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get<string>('DB_HOST', 'localhost'),
            port: Number(configService.get<string>('DB_PORT', '5432')),
            username: configService.get<string>('DB_USERNAME', 'postgres'),
            password: configService.get<string>('DB_PASSWORD', 'postgres'),
            database: configService.get<string>('DB_NAME', 'ocr_backend'),
            autoLoadEntities: true,
            synchronize: false,
            schema: configService.get<string>('DB_SCHEMA', 'frametracker'),
          }),
        }),
      ];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ...databaseImports,
    OcrModule,
    OpenaiModule,
    JogadoresModule,
    TorneiosModule,
    PartidasModule,
    ParticipantesTorneioModule,
  ],
})
export class AppModule {}
