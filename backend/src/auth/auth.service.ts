import { Injectable, ConflictException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, displayName } = registerDto;
    const client = this.supabaseService.getClient();

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const uid = client ? randomUUID() : 'mock-uid-' + Date.now();

    const userData = {
      uid,
      email: email.toLowerCase(),
      displayName,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    if (!client) {
      // In-memory simulation fallback for local offline testing
      const payload = { sub: uid, email: userData.email };
      return {
        accessToken: this.jwtService.sign(payload),
        user: {
          uid,
          email: userData.email,
          displayName: userData.displayName,
        },
      };
    }

    try {
      // Check if user already exists
      const { data: existingUser, error: queryError } = await client
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (queryError) {
        throw new InternalServerErrorException('Error checking existing user: ' + queryError.message);
      }

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Save user profile to Supabase
      const { error: insertError } = await client
        .from('users')
        .insert(userData);

      if (insertError) {
        throw new InternalServerErrorException('Error creating user profile: ' + insertError.message);
      }

      const payload = { sub: uid, email: userData.email };
      return {
        accessToken: this.jwtService.sign(payload),
        user: {
          uid,
          email: userData.email,
          displayName: userData.displayName,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Error registering new user: ' + error.message);
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const client = this.supabaseService.getClient();

    if (!client) {
      // Mock validation to help compile/test when Supabase configuration isn't loaded
      const mockUid = 'mock-uid-123';
      const payload = { sub: mockUid, email: email.toLowerCase() };
      return {
        accessToken: this.jwtService.sign(payload),
        user: {
          uid: mockUid,
          email: email.toLowerCase(),
          displayName: 'Demo User (Offline Mode)',
        },
      };
    }

    try {
      const { data: userData, error: loginQueryError } = await client
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (loginQueryError) {
        throw new InternalServerErrorException('Error checking user credentials: ' + loginQueryError.message);
      }

      if (!userData) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, userData.passwordHash);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { sub: userData.uid, email: userData.email };
      return {
        accessToken: this.jwtService.sign(payload),
        user: {
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Error signing in: ' + error.message);
    }
  }
}
