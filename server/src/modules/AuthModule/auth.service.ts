import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { users, refreshTokens, roles, passports } from '../database/schema';
import { eq } from 'drizzle-orm';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly databaseService: DatabaseService
  ) {}

  private async getDefaultRoleId() {
    const customerRole = await this.databaseService.db
      .select()
      .from(roles)
      .where(eq(roles.name, 'customer'))
      .limit(1);

    const guestRole = await this.databaseService.db
      .select()
      .from(roles)
      .where(eq(roles.name, 'guest'))
      .limit(1);

    return customerRole[0]?.id || guestRole[0]?.id || 1;
  }

  async register(dto: RegisterDto) {
    // uniqueness checks
    const existing = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);
    if (existing.length > 0) {
      throw new BadRequestException('Email already in use');
    }

    const existingLogin = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.login, dto.login))
      .limit(1);
    if (existingLogin.length > 0) {
      throw new BadRequestException('Login already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const roleId = await this.getDefaultRoleId();

    const [createdUser] = await this.databaseService.db
      .insert(users)
      .values({
        login: dto.login,
        email: dto.email,
        name: dto.name,
        surName: dto.surName,
        phone: dto.phone || null,
        passwordHash,
        roleId,
      })
      .returning();

    await this.databaseService.db.insert(passports).values({
      userId: createdUser.id,
      identityNumber: dto.passportIdentityNumber,
      nationality: dto.passportNationality,
      birthDate: new Date(dto.passportBirthDate),
      gender: dto.passportGender,
      expirationDate: new Date(dto.passportExpirationDate),
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _pwd, ...userWithoutPassword } = createdUser;
    return this.login(userWithoutPassword);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userData = user[0];

    // Check if user is OAuth-only (no password)
    if (!userData.passwordHash) {
      throw new UnauthorizedException(
        'Please sign in with your OAuth provider'
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      userData.passwordHash
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _pwd, ...result } = userData;
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, roleId: user.roleId };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = await this.generateRefreshToken(user.id);

    // Get role name
    const role = await this.databaseService.db
      .select()
      .from(roles)
      .where(eq(roles.id, user.roleId))
      .limit(1);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        surName: user.surName,
        roleId: user.roleId,
        roleName: role[0]?.name || 'guest',
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const tokenRecord = await this.databaseService.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, refreshToken))
      .limit(1);

    if (tokenRecord.length === 0) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const token = tokenRecord[0];

    // Check if token is expired
    if (token.expiresAt < new Date()) {
      // Delete expired token
      await this.databaseService.db
        .delete(refreshTokens)
        .where(eq(refreshTokens.id, token.id));
      throw new UnauthorizedException('Refresh token expired');
    }

    // Get user
    const user = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.id, token.userId))
      .limit(1);

    if (user.length === 0) {
      throw new UnauthorizedException('User not found');
    }

    const userData = user[0];
    const payload = {
      email: userData.email,
      sub: userData.id,
      roleId: userData.roleId,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    return {
      access_token: accessToken,
    };
  }

  async generateRefreshToken(userId: number): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.databaseService.db.insert(refreshTokens).values({
      userId,
      token,
      expiresAt,
    });

    return token;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.databaseService.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.token, token));
  }

  async validateGoogleUser(profile: any) {
    const email = profile.emails[0].value;
    const googleId = profile.id;

    // Try to find user by OAuth ID first
    let existingUser = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.oauthId, googleId))
      .limit(1);

    // If not found, try by email
    if (existingUser.length === 0) {
      existingUser = await this.databaseService.db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
    }

    if (existingUser.length > 0) {
      const user = existingUser[0];
      // Update OAuth info if not set
      if (!user.oauthId) {
        await this.databaseService.db
          .update(users)
          .set({
            oauthId: googleId,
            oauthProvider: 'google',
          })
          .where(eq(users.id, user.id));
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _pwd, ...result } = user;
      return result;
    }

    const defaultRoleId = await this.getDefaultRoleId();

    const newUser = await this.databaseService.db
      .insert(users)
      .values({
        email,
        login: email.split('@')[0] + '_' + googleId.slice(0, 8),
        name: profile.name.givenName || 'User',
        surName: profile.name.familyName || '',
        phone: null,
        passwordHash: null, // OAuth users don't have password
        oauthProvider: 'google',
        oauthId: googleId,
        roleId: defaultRoleId,
      })
      .returning();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _pass, ...result } = newUser[0];
    return result;
  }

  async googleLogin(user: any) {
    const payload = { email: user.email, sub: user.id, roleId: user.roleId };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = await this.generateRefreshToken(user.id);

    // Get role name
    const role = await this.databaseService.db
      .select()
      .from(roles)
      .where(eq(roles.id, user.roleId))
      .limit(1);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        surName: user.surName,
        roleId: user.roleId,
        roleName: role[0]?.name || 'guest',
      },
    };
  }
}
