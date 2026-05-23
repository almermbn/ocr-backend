import { Injectable } from '@nestjs/common';
import { UploadedImage } from 'src/openai/types';
import { OpenaiService } from '../openai/openai.service';
import { OcrReadResponseDto } from './dto/ocr-read-response.dto';
import { PlayerBindingDto } from './dto/player-binding.dto';

@Injectable()
export class OcrService {
  constructor(private readonly openaiService: OpenaiService) {}

  async read(
    image: UploadedImage,
    players: PlayerBindingDto[],
  ): Promise<OcrReadResponseDto> {
    const ocrResponse = await this.openaiService.readBowlingScores(
      image.buffer,
      image.mimetype,
      players,
    );

    const bindingsByLetter = new Map(
      players.map((player) => [player.letter, player]),
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

    for (const binding of players) {
      const alreadyIncluded = sanitizedPlayers.some(
        (player) => player.letter === binding.letter,
      );

      if (!alreadyIncluded) {
        sanitizedPlayers.push({
          letter: binding.letter,
          playerId: binding.playerId,
          playerName: binding.playerName,
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
