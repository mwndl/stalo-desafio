import { IsString, IsNotEmpty, IsOptional, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Nome da empresa/organização',
    example: 'Minha Empresa Ltda',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    description: 'Slug único para a empresa (usado em URLs e emails)',
    example: 'minha-empresa-ltda',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug deve conter apenas letras minúsculas, números e hífens',
  })
  @Length(2, 50)
  slug: string;

  @ApiProperty({
    description: 'Descrição da empresa (opcional)',
    example: 'Empresa especializada em soluções tecnológicas',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;
}
