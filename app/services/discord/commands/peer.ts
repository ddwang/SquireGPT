// import fetch from 'node-fetch';
import { SlashCommandBuilder } from "@discordjs/builders";
import { ConversationAgent } from "../../../agents";
import { agentConfig } from "../../../config/index";

export default {
    data: new SlashCommandBuilder()
        .setName("peer")
        .setDescription("Ask PeerBot a question.")
        .addStringOption((option) =>
            option
                .setName("question")
                .setRequired(true)
                .setDescription("What is your question?")
        ),

    async execute(interaction: any) {

        const question = interaction.options.getString("question");

        await interaction.deferReply();

        const chat = new ConversationAgent(agentConfig.context);

        let embed = await chat.getResponse(question)
            .then((res: any) => {

                console.log(res)
                return {
                    title: question,
                    description: res
                };
            })
            .catch((error: any) => console.log(error));

        try {
            await interaction.editReply({ embeds: [embed] });
        } catch (e) {
            console.log(e);
        }
    },
};