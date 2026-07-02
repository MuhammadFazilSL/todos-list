import { Injectable, ConflictException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { FirebaseService } from '../firebase/firebase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, displayName } = registerDto;
    const db = this.firebaseService.firestore;

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const uid = db ? db.collection('users').doc().id : 'mock-uid-' + Date.now();

    const userData = {
      uid,
      email: email.toLowerCase(),
      displayName,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    if (!db) {
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
      const userQuery = await db
        .collection('users')
        .where('email', '==', email.toLowerCase())
        .limit(1)
        .get();

      if (!userQuery.empty) {
        throw new ConflictException('User with this email already exists');
      }

      // Save user profile to Firestore
      await db.collection('users').doc(uid).set(userData);

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
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error registering new user: ' + error.message);
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const db = this.firebaseService.firestore;

    if (!db) {
      // Mock validation to help compile/test when Firebase configuration isn't loaded
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
      const userQuery = await db
        .collection('users')
        .where('email', '==', email.toLowerCase())
        .limit(1)
        .get();

      if (userQuery.empty) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const userDoc = userQuery.docs[0];
      const userData = userDoc.data();

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
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Error signing in: ' + error.message);
    }
  }
}
