import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { UploadedImage } from 'src/openai/types';
import { OpenaiService } from '../openai/openai.service';
import { OcrReadResponseDto } from './dto/ocr-read-response.dto';
import { PlayerBindingDto } from './dto/player-binding.dto';

@Injectable()
export class OcrService {
  constructor(private readonly openaiService: OpenaiService) {}

  private parsePlayers(raw: unknown): PlayerBindingDto[] {
    let parsed: unknown;

    if (typeof raw === 'string') {
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new BadRequestException('players must be a valid JSON array');
      }
    } else {
      parsed = raw;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new BadRequestException('players must be a non-empty array');
    }

    const players = plainToInstance(PlayerBindingDto, parsed);

    for (const player of players) {
      const errors = validateSync(player);
      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }
    }

    const uniqueLetters = new Set(players.map((p) => p.letter));
    if (uniqueLetters.size !== players.length) {
      throw new BadRequestException('players contains duplicated letters');
    }

    return players;
  }

  async read(
    image: UploadedImage,
    players: PlayerBindingDto[] | string,
  ): Promise<OcrReadResponseDto> {
    const parsedPlayers = this.parsePlayers(players);
    const ocrResponse = await this.openaiService.readBowlingScores(
      image.buffer,
      image.mimetype,
      parsedPlayers,
    );

    const bindingsByLetter = new Map(
      parsedPlayers.map((player) => [player.letter, player]),
    );

    const sanitizedPlayers = (ocrResponse.players ?? [])
      .filter((player) =>
        bindingsByLetter.has(player.letter as PlayerBindingDto['letter']),
      )
      .map((player) => {
        const binding = bindingsByLetter.get(
          player.letter as PlayerBindingDto['letter'],
        );
        return {
          ...player,
          letter: binding!.letter,
          playerId: binding!.playerId,
          playerName: binding!.playerName,
        };
      });

    for (const binding of parsedPlayers) {
      const alreadyIncluded = sanitizedPlayers.some(
        (player) => player.letter === binding.letter,
      );
      const player = ocrResponse.players.find(
        (player) => player.letter === (binding.letter as string),
      );
      if (!alreadyIncluded) {
        sanitizedPlayers.push({
          letter: binding.letter,
          playerId: binding.playerId,
          playerName: binding.playerName,
          needsReview: player?.needsReview ?? true,
          totalCandidates: player?.totalCandidates ?? [],
          scores: [],
          total: 0,
        });
      }
    }

    return {
      players: sanitizedPlayers,
    };
  }
}
