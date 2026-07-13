import { Module } from '@nestjs/common';
import { OpenaiModule } from '../openai/openai.module';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';

@Module({
  imports: [OpenaiModule],
  controllers: [OcrController],
  providers: [OcrService],
})
export class OcrModule {}
