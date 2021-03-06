import { BotIntent, BotUser } from '@bhtbot/bhtbot';

import GatewayAnswer from './GatewayAnswer';
import GatewayRequestEntity from './GatewayRequestEntity';

export default class GatewayRequest {
  intent: BotIntent;
  entities: GatewayRequestEntity[];
  intent_ranking: BotIntent[];
  text: string;
  user?: BotUser;
  history: string[];
  answer: GatewayAnswer;
}
