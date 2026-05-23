# OCR Backend (NestJS)

Backend para o app Frame Track, com OCR de súmulas/placares de boliche usando OpenAI Vision.

## Stack

- NestJS (Express padrão)
- TypeORM
- PostgreSQL
- OpenAI
- ConfigModule (.env)

## Configuração

1. Copie `.env.example` para `.env`
2. Preencha `OPENAI_API_KEY`
3. Configure as variáveis do PostgreSQL
4. Instale dependências:

```bash
npm install
```

## Endpoint OCR

`POST /ocr/read` com `multipart/form-data`:

- `image`: arquivo da imagem (`jpg`, `jpeg`, `png`, `webp`, até 10MB)
- `players`: JSON (string) com mapeamento de letras A-H para jogadores

Exemplo de `players`:

```json
[
  { "letter": "A", "playerId": 1, "playerName": "Almer Nakano" },
  { "letter": "B", "playerId": 2, "playerName": "Maria Santos" }
]
```

Resposta esperada:

```json
{
  "players": [
    {
      "letter": "A",
      "playerId": 1,
      "playerName": "Almer Nakano",
      "scores": [
        {
          "game": 1,
          "value": 149,
          "candidates": [149, 199],
          "needsReview": true,
          "reason": "dígito central ambíguo"
        }
      ],
      "total": 1001
    }
  ]
}
```
