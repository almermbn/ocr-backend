import {
  Body,
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrReadRequestDto } from './dto/ocr-read-request.dto';
import { OcrReadResponseDto } from './dto/ocr-read-response.dto';
import { PlayerBindingDto } from './dto/player-binding.dto';
import { PlayersJsonPipe } from './pipes/players-json.pipe';
import { OcrService } from './ocr.service';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('read')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: MAX_IMAGE_BYTES,
      },
    }),
  )
  async read(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/i })
        .addMaxSizeValidator({ maxSize: MAX_IMAGE_BYTES })
        .build({
          fileIsRequired: true,
        }),
    )
    image: Express.Multer.File,
    @Body('players', PlayersJsonPipe) players: PlayerBindingDto[],
    @Body() _body: OcrReadRequestDto,
  ): Promise<OcrReadResponseDto> {
    return this.ocrService.read(image, players);
  }
}
