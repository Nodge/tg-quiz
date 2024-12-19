import { Bot } from './bot';
import { registerAnswerHandler } from './commands/answer-handler';
import { registerMessageHandler } from './commands/message-handler';
import { registerResultsCommand } from './commands/results';
import { registerStartCommand } from './commands/start';

export function initCommands(bot: Bot) {
    registerStartCommand(bot);
    registerAnswerHandler(bot);
    registerResultsCommand(bot);
    registerMessageHandler(bot);
}
