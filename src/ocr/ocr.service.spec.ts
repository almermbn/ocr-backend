import { Test } from '@nestjs/testing';
import { OpenaiService } from '../openai/openai.service';
import { OcrService } from './ocr.service';

describe('OcrService', () => {
  it('keeps player mapping based on payload letters', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        OcrService,
        {
          provide: OpenaiService,
          useValue: {
            readBowlingScores: jest.fn().mockResolvedValue({
              players: [
                {
                  letter: 'A',
                  playerId: 999,
                  playerName: 'Nome Inferido',
                  scores: [
                    {
                      game: 1,
                      value: 149,
                      candidates: [149, 199],
                      needsReview: true,
                      reason: 'dígito central ambíguo',
                    },
                  ],
                  total: 149,
                },
              ],
            }),
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(OcrService);

    const result = await service.read(
      {
        buffer: Buffer.from('image-content'),
        mimetype: 'image/png',
      } as Express.Multer.File,
      [
        {
          letter: 'A',
          playerId: 1,
          playerName: 'Almer Nakano',
        },
      ],
    );

    expect(result.players).toHaveLength(1);
    expect(result.players[0].playerId).toBe(1);
    expect(result.players[0].playerName).toBe('Almer Nakano');
    expect(result.players[0].scores[0].candidates).toEqual([149, 199]);
  });
});
