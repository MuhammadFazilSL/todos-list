import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;

  onModuleInit() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const isDummy =
      !supabaseUrl ||
      !supabaseKey ||
      supabaseUrl.includes('dummy') ||
      supabaseKey.includes('dummy');

    if (isDummy) {
      this.logger.warn(
        'Supabase credentials not fully configured or using dummy values. Running in OFFLINE MOCK MODE with local repositories.',
      );
      this.client = null;
      return;
    }

    try {
      this.client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
        },
      });
      this.logger.log('Supabase client initialized successfully.');
    } catch (error) {
      this.logger.error('Error initializing Supabase client:', error.stack);
      this.client = null;
    }
  }

  getClient(): SupabaseClient | null {
    return this.client;
  }
}
