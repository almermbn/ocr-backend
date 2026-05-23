import {
  BadRequestException,
  Injectable,
  PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { PlayerBindingDto } from '../dto/player-binding.dto';

@Injectable()
export class PlayersJsonPipe implements PipeTransform<
  string,
  PlayerBindingDto[]
> {
  transform(value: string): PlayerBindingDto[] {
    if (!value) {
      throw new BadRequestException('players is required');
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(value);
    } catch {
      throw new BadRequestException('players must be a valid JSON array');
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new BadRequestException('players must be a non-empty array');
    }

    const players = plainToInstance(PlayerBindingDto, parsed);

    for (const player of players) {
      const validationErrors = validateSync(player);

      if (validationErrors.length > 0) {
        throw new UnprocessableEntityException(validationErrors);
      }
    }

    const uniqueLetters = new Set(players.map((player) => player.letter));
    if (uniqueLetters.size !== players.length) {
      throw new BadRequestException('players contains duplicated letters');
    }

    return players;
  }
}
