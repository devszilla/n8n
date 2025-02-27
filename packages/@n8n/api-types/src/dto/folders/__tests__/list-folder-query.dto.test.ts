import { ListFolderQueryDto } from '../list-folder-query.dto';

describe('ListFolderQueryDto', () => {
	describe('Valid requests', () => {
		test.each([
			{
				name: 'empty object (no filters)',
				request: {},
			},
			{
				name: 'valid filter',
				request: {
					filter: '{"name":"test"}',
				},
			},
			{
				name: 'filter with parentFolderId',
				request: {
					filter: '{"parentFolderId":"abc123"}',
				},
			},
			{
				name: 'filter with name and parentFolderId',
				request: {
					filter: '{"name":"test","parentFolderId":"abc123"}',
				},
			},
			{
				name: 'filter with tags array',
				request: {
					filter: '{"tags":["important","archived"]}',
				},
			},
			{
				name: 'filter with empty tags array',
				request: {
					filter: '{"tags":[]}',
				},
			},
			{
				name: 'filter with all properties',
				request: {
					filter: '{"name":"test","parentFolderId":"abc123","tags":["important"]}',
				},
			},
			{
				name: 'valid select',
				request: {
					select: '["id","name"]',
				},
			},
			{
				name: 'valid sortBy',
				request: {
					sortBy: 'name:asc',
				},
			},
			{
				name: 'valid skip and take',
				request: {
					skip: '0',
					take: '10',
				},
			},
			{
				name: 'full query parameters',
				request: {
					filter: '{"name":"test","tags":["important"]}',
					select: '["id","name","createdAt","tags"]',
					skip: '0',
					take: '10',
					sortBy: 'createdAt:desc',
				},
			},
		])('should validate $name', ({ request }) => {
			const result = ListFolderQueryDto.safeParse(request);
			expect(result.success).toBe(true);
		});
	});

	describe('Invalid requests', () => {
		test.each([
			{
				name: 'invalid filter format',
				request: {
					filter: 'not-json',
				},
				expectedErrorPath: ['filter'],
			},
			{
				name: 'filter with invalid field',
				request: {
					filter: '{"unknownField":"test"}',
				},
				expectedErrorPath: ['filter'],
			},
			{
				name: 'filter with tags not as array',
				request: {
					filter: '{"tags":"important"}',
				},
				expectedErrorPath: ['filter'],
			},
			{
				name: 'filter with tags array containing non-string values',
				request: {
					filter: '{"tags":["important", 123]}',
				},
				expectedErrorPath: ['filter'],
			},
			{
				name: 'invalid select format',
				request: {
					select: 'id,name', // Not an array
				},
				expectedErrorPath: ['select'],
			},
			{
				name: 'select with invalid field',
				request: {
					select: '["id","invalidField"]',
				},
				expectedErrorPath: ['select'],
			},
			{
				name: 'invalid skip format',
				request: {
					skip: 'not-a-number',
					take: '10',
				},
				expectedErrorPath: ['skip'],
			},
			{
				name: 'invalid take format',
				request: {
					skip: '0',
					take: 'not-a-number',
				},
				expectedErrorPath: ['take'],
			},
			{
				name: 'invalid sortBy value',
				request: {
					sortBy: 'invalid-value',
				},
				expectedErrorPath: ['sortBy'],
			},
		])('should fail validation for $name', ({ request, expectedErrorPath }) => {
			const result = ListFolderQueryDto.safeParse(request);

			expect(result.success).toBe(false);

			if (expectedErrorPath && result.success === false) {
				if (Array.isArray(expectedErrorPath)) {
					const errorPaths = result.error.issues[0].path;
					expect(errorPaths).toContain(expectedErrorPath[0]);
				}
			}
		});
	});
});
