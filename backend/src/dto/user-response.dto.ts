import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
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
    description: 'CPF do usuário',
    example: '12345678901',
    required: false,
  })
  cpf?: string;

  @ApiProperty({
    description: 'Status ativo do usuário',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Data de criação do usuário',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do usuário',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}

