import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { OcrReadResponseDto } from '../ocr/dto/ocr-read-response.dto';
import { PlayerBindingDto } from '../ocr/dto/player-binding.dto';

@Injectable()
export class OpenaiService {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException(
        'OPENAI_API_KEY is not configured',
      );
    }

    this.client = new OpenAI({ apiKey });
    this.model = this.configService.get<string>(
      'OPENAI_VISION_MODEL',
      'gpt-4.1-mini',
    );
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
                  '- A imagem pode ser uma súmula manuscrita/impressa OU uma foto de placar eletrônico.',
                  '- NÃO inferir nomes pela imagem.',
                  '- Usar apenas este mapeamento de letras A-H para vincular resultados:',
                  JSON.stringify(playersReference),

                  'Regra para súmula:',
                  '- Se for uma súmula, extraia as partidas 1ª até 6ª quando existirem.',
                  '- Para ambiguidades, sempre preencher candidates com alternativas.',
                  '- Definir needsReview=true quando houver rasura, baixa confiança ou dígito ambíguo.',

                  'Regra para placar eletrônico:',
                  '- Se for uma foto de placar eletrônico, extraia apenas a letra do jogador e o total individual final exibido na mesma linha do jogador.',
                  '- O total individual normalmente fica no extremo direito da própria linha do jogador.',
                  '- NÃO use números grandes exibidos em caixas separadas abaixo, no rodapé ou fora da linha do jogador.',
                  '- Ignore totais gerais do par de pistas, soma da equipe, série, subtotal ou placar agregado.',
                  '- Exemplo: se D tem 157 na linha e há 278 em uma caixa inferior, o total de D é 157, não 278.',
                  '- Para placar eletrônico, retorne scores como array vazio [].',
                  '- Se houver dúvida entre total individual e total agregado, use o número alinhado horizontalmente com a letra do jogador e marque needsReview=true.',

                  'Formato obrigatório de resposta:',
                  '{',
                  '  "players": [',
                  '    {',
                  '      "letter": "A",',
                  '      "playerId": 1,',
                  '      "playerName": "Nome",',
                  '      "scores": [',
                  '        {',
                  '          "game": 1,',
                  '          "value": 149,',
                  '          "candidates": [149,199],',
                  '          "needsReview": true,',
                  '          "reason": "dígito central ambíguo"',
                  '        }',
                  '      ],',
                  '      "total": 1001,',
                  '      "totalCandidates": [1001],',
                  '      "needsReview": false',
                  '    }',
                  '  ]',
                  '}',

                  'Regras finais:',
                  '- Responda SOMENTE JSON válido.',
                  '- Não inclua comentários, markdown ou explicações.',
                  '- Nunca retorne jogadores que não estejam no mapeamento enviado.',
                  '- Se uma letra do placar não existir no mapeamento, ignore essa letra.',
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
      console.error('OPENAI OCR ERROR:', error);

      if (error instanceof BadGatewayException) {
        throw error;
      }

      throw new BadGatewayException(
        error instanceof Error
          ? error.message
          : 'Failed to process OCR with OpenAI',
      );
    }
  }
}
