import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    const clientID = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const callbackURL =
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:3333/auth/google/callback';

    if (!clientID || !clientSecret) {
      throw new Error(
        'Google OAuth is not configured: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET'
      );
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
      // Nest Passport guard already sets session to false, keep auth request stateless
      passReqToCallback: false,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ): Promise<any> {
    const { id, name, emails, photos, provider } = profile;
    const user = {
      id,
      emails,
      name,
      photos,
      provider,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
