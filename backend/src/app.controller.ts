import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './entities/user.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('users')
  async getUsers(): Promise<User[]> {
    return this.appService.getUsers();
  }

  @Post('users')
  async createUser(@Body() userData: Partial<User>): Promise<User> {
    return this.appService.createUser(userData);
  }
}
