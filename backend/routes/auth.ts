import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'smartcart_default_secret_key_12345';

// Relying Party Configurations for Passkey Authentication
const RP_ID = 'localhost';
const RP_NAME = 'SmartCart System';
const ORIGIN = 'http://localhost:5173';

// In-Memory Challenge Store (mapped by email)
const challengeStore = new Map<string, string>();

// JWT Helper
const generateToken = (user: any) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// 1. Email Registration
router.post('/register', async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Auto-grant admin role for special emails to facilitate testing
    const role = email.toLowerCase().endsWith('@smartcart.admin') ? 'admin' : 'customer';

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role
    });

    await newUser.save();

    const token = generateToken(newUser);
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Email Login
router.post('/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'This account uses biometric/social sign-in. Please log in using that method.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Mock Google/Facebook OAuth
router.post('/oauth-login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, name, provider } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: 'Email and Name are required' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create a new account if one does not exist for the OAuth user
      const role = email.toLowerCase().endsWith('@smartcart.admin') ? 'admin' : 'customer';
      user = new User({
        name,
        email,
        phone: '0000000000', // default mock phone
        role
      });
      await user.save();
    }

    const token = generateToken(user);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 3a. Real Google OAuth Verification
router.post('/google-login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google Credential (ID Token) is required' });
    }

    // Verify token using Google tokeninfo API
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!response.ok) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const payload = await response.json();
    const { email, name, aud } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Google account does not provide email' });
    }

    // Verify aud matches expected client ID if configured
    const expectedAud = process.env.GOOGLE_CLIENT_ID;
    if (expectedAud && aud !== expectedAud) {
      return res.status(400).json({ message: 'Token audience mismatch' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const role = email.toLowerCase().endsWith('@smartcart.admin') ? 'admin' : 'customer';
      user = new User({
        name: name || email.split('@')[0],
        email,
        phone: '0000000000', // default mock phone
        role
      });
      await user.save();
    }

    const token = generateToken(user);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 3b. Real Facebook OAuth Verification
router.post('/facebook-login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: 'Facebook Access Token is required' });
    }

    // Verify token and fetch user details from Facebook Graph API
    const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
    if (!response.ok) {
      return res.status(400).json({ message: 'Invalid Facebook access token' });
    }

    const payload = await response.json();
    const { id, name, email } = payload;

    // Use facebook email, or fallback to mock email if not present
    const userEmail = email || `${id}@facebook.com`;

    let user = await User.findOne({ email: userEmail });

    if (!user) {
      const role = userEmail.toLowerCase().endsWith('@smartcart.admin') ? 'admin' : 'customer';
      user = new User({
        name: name || 'Facebook User',
        email: userEmail,
        phone: '0000000000', // default mock phone
        role
      });
      await user.save();
    }

    const token = generateToken(user);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Passkey Registration Options
router.post('/passkey/register-options', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    let user = await User.findOne({ email });
    
    // Create pre-user container if registering passkey first
    if (!user) {
      user = new User({
        name: name || email.split('@')[0],
        email,
        phone: '0000000000',
        role: email.toLowerCase().endsWith('@smartcart.admin') ? 'admin' : 'customer'
      });
      await user.save();
    }

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: Buffer.from(user._id.toString()),
      userName: user.email,
      userDisplayName: user.name,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
    });

    challengeStore.set(user.email, options.challenge);

    res.json(options);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 5. Passkey Registration Verification
router.post('/passkey/register-verify', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, credential } = req.body;

    if (!email || !credential) {
      return res.status(400).json({ message: 'Email and credential response are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const expectedChallenge = challengeStore.get(email);
    if (!expectedChallenge) {
      return res.status(400).json({ message: 'Challenge expired or not found' });
    }

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;
      const credentialPublicKey = credential.publicKey;
      const credentialID = credential.id;
      const counter = credential.counter;

      // Check if credential ID already registered
      const credentialIDStr = typeof credentialID === 'string' ? credentialID : Buffer.from(credentialID).toString('base64url');
      const isAlreadyRegistered = user.passkeys.some(pk => pk.credentialID === credentialIDStr);

      if (!isAlreadyRegistered) {
        user.passkeys.push({
          credentialID: credentialIDStr,
          publicKey: typeof credentialPublicKey === 'string' ? credentialPublicKey : Buffer.from(credentialPublicKey).toString('base64url'),
          counter,
          deviceType: verification.registrationInfo.credentialDeviceType,
          backedUp: verification.registrationInfo.credentialBackedUp,
          transports: credential.transports || []
        });
        await user.save();
      }

      challengeStore.delete(email);

      const token = generateToken(user);
      res.json({
        verified: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    } else {
      res.status(400).json({ verified: false, message: 'Passkey verification failed' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 6. Passkey Login Options
router.post('/passkey/login-options', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user || user.passkeys.length === 0) {
      return res.status(400).json({ message: 'No passkeys registered for this email' });
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: user.passkeys.map(pk => ({
        id: pk.credentialID,
        type: 'public-key' as const,
        transports: pk.transports as AuthenticatorTransport[],
      })),
      userVerification: 'preferred',
    });

    challengeStore.set(user.email, options.challenge);

    res.json(options);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 7. Passkey Login Verification
router.post('/passkey/login-verify', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, credential } = req.body;

    if (!email || !credential) {
      return res.status(400).json({ message: 'Email and credential response are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const passkey = user.passkeys.find(pk => pk.credentialID === credential.id);
    if (!passkey) {
      return res.status(400).json({ message: 'Passkey not recognized' });
    }

    const expectedChallenge = challengeStore.get(email);
    if (!expectedChallenge) {
      return res.status(400).json({ message: 'Challenge expired or not found' });
    }

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: passkey.credentialID,
        publicKey: Buffer.from(passkey.publicKey, 'base64url'),
        counter: passkey.counter,
      },
    });

    if (verification.verified) {
      // Update counter
      passkey.counter = verification.authenticationInfo.newCounter;
      await user.save();

      challengeStore.delete(email);

      const token = generateToken(user);
      res.json({
        verified: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    } else {
      res.status(400).json({ verified: false, message: 'Passkey authentication failed' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
