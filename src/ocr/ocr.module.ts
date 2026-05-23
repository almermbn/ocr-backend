import { Module } from '@nestjs/common';
import { OpenaiModule } from '../openai/openai.module';
import { OcrController } from './ocr.controller';
import { PlayersJsonPipe } from './pipes/players-json.pipe';
import { OcrService } from './ocr.service';

@Module({
  imports: [OpenaiModule],
  controllers: [OcrController],
  providers: [OcrService, PlayersJsonPipe],
})
export class OcrModule {}
