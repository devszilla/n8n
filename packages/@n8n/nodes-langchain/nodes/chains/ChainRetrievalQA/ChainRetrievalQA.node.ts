import {
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

import { RetrievalQAChain } from 'langchain/chains';
import type { BaseLanguageModel } from 'langchain/dist/base_language';
import { BaseRetriever } from 'langchain/schema/retriever';
import { getAndValidateSupplyInput } from '../../../utils/getAndValidateSupplyInput';

export class ChainRetrievalQA implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Retrieval QA Chain',
		name: 'chainRetrievalQa',
		icon: 'fa:link',
		group: ['transform'],
		version: 1,
		description: 'Chain to run QA on a retrieved document',
		defaults: {
			name: 'Retrieval QA Chain',
			color: '#408080',
		},
		codex: {
			alias: ['LangChain'],
			categories: ['AI'],
			subcategories: {
				AI: ['Chains'],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: ['main', 'vectorRetriever', 'languageModel'],
		inputNames: ['', 'Vector Retriever', 'Language Model'],
		outputs: ['main'],
		// outputNames: ['', 'Chain'],
		credentials: [],
		properties: [
			{
				displayName: 'Mode',
				name: 'mode',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Run Once for All Items',
						value: 'runOnceForAllItems',
						description: 'Run this chain only once, no matter how many input items there are',
					},
					{
						name: 'Run Once for Each Item',
						value: 'runOnceForEachItem',
						description: 'Run this chain as many times as there are input items',
					},
				],
				default: 'runOnceForAllItems',
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		this.logger.verbose('Executing Retrieval QA Chain');

		const model = (await getAndValidateSupplyInput(
			this,
			'languageModel',
			true,
		)) as BaseLanguageModel;
		const vectorRetriever = (await getAndValidateSupplyInput(
			this,
			'vectorRetriever',
			true,
		)) as BaseRetriever;

		const items = this.getInputData();
		const chain = RetrievalQAChain.fromLLM(model, vectorRetriever!);

		const returnData: INodeExecutionData[] = [];
		const runMode = this.getNodeParameter('mode', 0) as string;

		if (runMode === 'runOnceForAllItems') {
			const query = this.getNodeParameter('query', 0) as string;
			const response = await chain.call({ query });

			return this.prepareOutputData([{ json: { response } }]);
		}
		// Run for each item
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const query = this.getNodeParameter('query', itemIndex) as string;

			const response = await chain.call({ query });
			returnData.push({ json: { response } });
		}
		return this.prepareOutputData(returnData);
	}
}
