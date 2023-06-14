import { input, select } from '@inquirer/prompts';
import { ConversationAgent } from './agents/index';
import { processDocuments } from './agents/loaders/utils';
import { agentConfig } from './config/index';
import { runTask } from './agents/tasker';

export async function startReadline(server: any) {
    while (true) {
        const response = await select({
            message: 'Please choose an option:',
            choices: [
                { name: '1. Load documents via directory', value: '1' },
                { name: '2. Chat with agent', value: '2' }, // Add this line
                { name: '3. Babyagi', value: '3' }, // Add this line
                { name: '4. Kill server', value: '4' }, // Add this line
            ],
        });

        // Process the command
        const shouldExit = await processCommand(response, server);

        if (shouldExit) {
            break;
        }
    }
}

// Function to process CLI commands
async function processCommand(command: string, server: any): Promise<boolean> {

    switch (command) {
        case '1':
            const dirPath = await input({
                message: 'Enter the path of the directory to index:',
            });
            await processDocuments(dirPath);
            break;
        case '2':
            const chatResponse = await input({
                message: 'Chat with Agent:',
            });
            const chat = new ConversationAgent(agentConfig.context);

            const response = await chat.getResponse(chatResponse);

            // add line
            console.log(`Agent: ------------------------------------`);

            console.log(`${response}`);

            console.log(`----------------------------------------`);
            break;
        case '3':
            const objective = await input({
                message: 'What would you like to solve?',
            });
            await runTask(objective)

            break;

        case '4':
            console.log('Stopping the server...');
            server.close(() => {
                console.log('Server stopped.');
                process.exit(0);
            });
            return true;
        default:
            console.log('Invalid option. Please enter a valid option number.');
    }

    return false;
}