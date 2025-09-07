import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'ID único do usuário',
    example: 'daec2e84-cab3-42af-8f64-22ca04fe7a6b',
  })
  id: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'john.smith@techcorp-solutions.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'John Smith',
  })
  name: string;

  @ApiProperty({
    description: 'ID do tenant do usuário',
    example: 'e609bb39-2936-48dd-a7b5-e370188a8146',
  })
  tenantId: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token JWT para autenticação (válido por 15 minutos)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Refresh token para renovar o access token (válido por 7 dias)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refresh_token: string;

  @ApiProperty({
    description: 'Dados do usuário autenticado',
    type: UserDto,
  })
  user: UserDto;
}
