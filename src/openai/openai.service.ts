import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PlayerBindingDto } from '../ocr/dto/player-binding.dto';
import { OcrReadResponseDto } from '../ocr/dto/ocr-read-response.dto';

@Injectable()
export class OpenaiService {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException('OPENAI_API_KEY is not configured');
    }

    this.client = new OpenAI({ apiKey });
    this.model = this.configService.get<string>('OPENAI_VISION_MODEL', 'gpt-4.1-mini');
  }

  async readBowlingScores(
    imageBuffer: Buffer,
    mimeType: string,
    players: PlayerBindingDto[],
  ): Promise<OcrReadResponseDto> {
    const playersReference = players.map((player) => ({
      letter: player.letter,
      playerId: player.playerId,
      playerName: player.playerName,
    }));

    const imageBase64 = imageBuffer.toString('base64');

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Você é um OCR especializado em súmulas/placares de boliche. Responda SOMENTE JSON válido no formato solicitado.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: [
                  'Tarefa:',
                  '- Extrair scores de boliche da imagem enviada.',
                  '- NÃO inferir nomes pela imagem.',
                  '- Usar apenas este mapeamento de letras A-H para vincular resultados:',
                  JSON.stringify(playersReference),
                  '- Para ambiguidades, sempre preencher candidates com alternativas.',
                  '- Definir needsReview=true quando houver rasura, baixa confiança ou dígito ambíguo.',
                  '- Retornar JSON no formato:',
                  '{"players":[{"letter":"A","playerId":1,"playerName":"Nome","scores":[{"game":1,"value":149,"candidates":[149,199],"needsReview":true,"reason":"dígito central ambíguo"}],"total":1001}]}',
                ].join('\n'),
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        throw new BadGatewayException('OpenAI returned an empty response');
      }

      return JSON.parse(content) as OcrReadResponseDto;
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }

      throw new BadGatewayException('Failed to process OCR with OpenAI');
    }
  }
}
