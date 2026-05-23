import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { PlayersJsonPipe } from './players-json.pipe';

describe('PlayersJsonPipe', () => {
  const pipe = new PlayersJsonPipe();

  it('parses valid players payload', () => {
    const result = pipe.transform(
      JSON.stringify([
        { letter: 'A', playerId: 1, playerName: 'Almer Nakano' },
        { letter: 'B', playerId: 2, playerName: 'Maria Santos' },
      ]),
    );

    expect(result).toHaveLength(2);
    expect(result[0].letter).toBe('A');
  });

  it('throws bad request for invalid json', () => {
    expect(() => pipe.transform('not-json')).toThrow(BadRequestException);
  });

  it('throws bad request for duplicated letters', () => {
    expect(() =>
      pipe.transform(
        JSON.stringify([
          { letter: 'A', playerId: 1, playerName: 'Almer Nakano' },
          { letter: 'A', playerId: 2, playerName: 'Outra Pessoa' },
        ]),
      ),
    ).toThrow(BadRequestException);
  });

  it('throws unprocessable entity for invalid letter', () => {
    expect(() =>
      pipe.transform(JSON.stringify([{ letter: 'X', playerId: 1, playerName: 'Almer Nakano' }])),
    ).toThrow(UnprocessableEntityException);
  });
});
