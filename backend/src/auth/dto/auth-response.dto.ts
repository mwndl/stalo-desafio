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
