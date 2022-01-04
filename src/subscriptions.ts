import { Snowflake } from 'discord.js';
import { MusicSubscription } from './lib/Subscription';

export const subscriptions = new Map<Snowflake, MusicSubscription>();
