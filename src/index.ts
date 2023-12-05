import page from './page.html';

export interface Env {
	MY_BUCKET: R2Bucket;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname === '/') {
			return new Response(page, {
				headers: {
					'content-type': 'text/html',
				},
			});
		}

		if (request.method === 'POST') {
			const formData = await request.formData();
			const file = formData.get('fileUpload');
			if (file instanceof File) {
				// Upload
				const result = await env.MY_BUCKET.put('key', file, {
					httpMetadata: {
						contentType: file.type,
					},
				});
				// Retrieve the uploaded file
				if (result) {
					const object = await env.MY_BUCKET.get(result.key);
					if (object) {
						return new Response(object.body, {
							headers: {
								'content-type': object.httpMetadata?.contentType ?? '',
							},
						});
					}
				}
			}
		}

		return new Response('Not Found', {
			status: 404,
		});
	},
};
