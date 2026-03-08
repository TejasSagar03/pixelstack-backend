import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth') 
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup') 
  async signup(@Body() signUpDto: any) {
    return this.authService.signup(signUpDto);
  }

  @Post('login') 
  async login(@Body() loginDto: any) {
    return this.authService.login(loginDto.identifier, loginDto.password);
  }
}