import { Hono } from 'hono';
import page from './page.html';

type Bindings = {
	MY_BUCKET: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', (c) => c.html(page));

app.post('/upload', async (c) => {
	const data = await c.req.parseBody<{ fileUpload: File }>();
	const file = data.fileUpload;
	// Upload
	const result = await c.env.MY_BUCKET.put('key', file, {
		httpMetadata: {
			contentType: file.type,
		},
	});
	// Retrieve the uploaded file
	if (result) {
		const object = await c.env.MY_BUCKET.get(result.key);
		if (object) {
			return c.body(object.body, 200, {
				'content-type': object.httpMetadata?.contentType ?? '',
			});
		}
	}
	return c.notFound();
});

export default app;
