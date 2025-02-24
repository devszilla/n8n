import type { Request, Response } from 'express';
import type { IHttpRequestMethods, IN8nHttpFullResponse } from 'n8n-workflow';

export type WebhookOptionsRequest = Request & { method: 'OPTIONS' };

export type WebhookRequest = Request<{ path: string }> & {
	method: IHttpRequestMethods;
	params: Record<string, string>;
};

export type WaitingWebhookRequest = WebhookRequest & {
	params: WebhookRequest['path'] & { suffix?: string };
};

export interface WebhookAccessControlOptions {
	allowedOrigins?: string;
}

export interface IWebhookManager {
	/** Gets all request methods associated with a webhook path*/
	getWebhookMethods?: (path: string) => Promise<IHttpRequestMethods[]>;

	/** Find the CORS options matching a path and method */
	findAccessControlOptions?: (
		path: string,
		httpMethod: IHttpRequestMethods,
	) => Promise<WebhookAccessControlOptions | undefined>;

	executeWebhook(req: WebhookRequest, res: Response): Promise<void>;
}

export type IWebhookResponsePromiseData =
	| { noWebhookResponse: true }
	| {
			noWebhookResponse?: false;
			response: IN8nHttpFullResponse;
	  };
