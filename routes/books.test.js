process.env.NODE_ENV = "test";

const request = require('supertest');
const app = require('../app');
const db = require('../db');
const Book = require('../models/book');

describe('Test book routes', () => {
    let book1;
    let book2;
    let book3data;

    beforeEach(async () => {
        await db.query(`DELETE FROM books`);

        const book1Data = {
            "isbn": "1111111111",
            "amazon_url": "http://hostname.co/asdf",
            "author": "Arthur Author",
            "language": "english",
            "pages": 123,
            "publisher": "Publisher",
            "title": "Book Title",
            "year": 2017
        };
        const book2Data = {
            "isbn": "2222222222222",
            "amazon_url": "http://hostname.co/qwerty",
            "author": "Bea Aruthur",
            "language": "spanish",
            "pages": 9,
            "publisher": "Another Publisher",
            "title": "Some Words",
            "year": 2020
        };

        book1 = await Book.create(book1Data);
        book2 = await Book.create(book2Data);

        // create this, but don't insert into db
        book3data = {
            "isbn": "3333333333",
            "amazon_url": "http://hostname.co/asdf",
            "author": "Unknown Author",
            "language": "a langauge",
            "pages": 420,
            "publisher": "the world",
            "title": "a picture book",
            "year": 1969
        };
    });

    describe('Test GET /books route', () => {
        test('Returns staus code 200', async () => {
            const response = await request(app).get('/books');

            expect(response.statusCode).toEqual(200);
        });
        test('Returns test books', async () => {
            const response = await request(app).get('/books');

            expect(response.body.books).toEqual(expect.arrayContaining([book1, book2]));
        });
    });

    describe('Test GET /books/:id route', () => {
        test('Returns status code 200', async () => {
            const response = await request(app).get(`/books/${book1.isbn}`);

            expect(response.statusCode).toEqual(200);
        });
        test('Returns book1 test data', async () => {
            const response = await request(app).get(`/books/${book1.isbn}`);

            expect(response.body.book).toEqual(book1);
        });
        test('Returns 404 not found when id does not exist', async () => {
            const response = await request(app).get(`/books/asdfgh`);

            expect(response.statusCode).toEqual(404);
        })
    });

    describe('Test POST /books route', () => {
        test('Returns 201 on successful post', async () => {
            const response = await request(app)
                .post('/books')
                .send(book3data)
            
            expect(response.statusCode).toEqual(201);
        });
        test('Returns inserted book', async () => {
            const response = await request(app)
                .post('/books')
                .send(book3data)
            
            expect(response.body.book).toEqual(book3data);
        });
        test('Returns 400 status code when isbn is too short', async () => {
            book3data.isbn = "333";
            const response = await request(app)
                .post('/books')
                .send(book3data)
            
            expect(response.statusCode).toEqual(400);
        });
        test('Returns 400 status code when isbn is too long', async () => {
            book3data.isbn = "3333333333333333";
            const response = await request(app)
                .post('/books')
                .send(book3data)
            
            expect(response.statusCode).toEqual(400);
        });
        test('Returns 400 status code when amazon_url is not a url', async () => {
            book3data.amazon_url = "asdfg";
            const response = await request(app)
                .post('/books')
                .send(book3data)
            
            expect(response.statusCode).toEqual(400);
        });
        test('Returns 400 status code when pages is less than 1', async () => {
            book3data.pages = 0;
            const response = await request(app)
                .post('/books')
                .send(book3data)
            
            expect(response.statusCode).toEqual(400);
        });
        test('Returns 400 status code when the year is a date string', async () => {
            book3data.year = "1/1/1900";
            const response = await request(app)
                .post('/books')
                .send(book3data)
            
            expect(response.statusCode).toEqual(400);
        });
        test('Returns 400 status code when year is in the future', async () => {
            book3data.year = 2050;
            const response = await request(app)
                .post('/books')
                .send(book3data)
            
            expect(response.statusCode).toEqual(400);
        });
        test('Returns 400 status code when title is missing', async () => {
            book3data.title = "";
            const response = await request(app)
                .post('/books')
                .send(book3data)
            
            expect(response.statusCode).toEqual(400);
        });
    });
    describe('Test PUT /books route', () => {
        test('Returns 200 on successful put', async () => {
            book2.title = "new title"
            const response = await request(app)
                .put(`/books/${book2.isbn}`)
                .send(book2);
            
            expect(response.statusCode).toEqual(200);
        });
        test('Returns updated book', async () => {
            book2.title = "new title"
            const response = await request(app)
                .put(`/books/${book2.isbn}`)
                .send(book2)
            
            expect(response.body.book).toEqual(book2);
        });
        test('Returns 400 status code when isbn is too short', async () => {
            book2.isbn = "222";
            const response = await request(app)
                .put(`/books/${book2.isbn}`)
                .send(book2)
            
            expect(response.statusCode).toEqual(400);
        });
        test('Returns 400 status code when isbn is too long', async () => {
            book2.isbn = "3333333333333333";
            const response = await request(app)
                .put(`/books/${book2.isbn}`)
                .send(book2)
            
            expect(response.statusCode).toEqual(400);
        });
        test('Returns 400 status code when amazon_url is not a url', async () => {
            book2.amazon_url = "asdfg";
            const response = await request(app)
                .put(`/books/${book2.isbn}`)
                .send(book2)
            
            expect(response.statusCode).toEqual(400);
        });
        test('Returns 400 status code when pages is less than 1', async () => {
            book2.pages = 0;
            const response = await request(app)
                .put(`/books/${book2.isbn}`)
                .send(book2)
            
            expect(response.statusCode).toEqual(400);
        });
        test('Returns 400 status code when the year is a date string', async () => {
            book2.year = "1/1/1900";
            const response = await request(app)
                .put(`/books/${book2.isbn}`)
                .send(book2)
            
            expect(response.statusCode).toEqual(400);
        });
        test('Returns 400 status code when year is in the future', async () => {
            book2.year = 2050;
            const response = await request(app)
                .put(`/books/${book2.isbn}`)
                .send(book2)
            
            expect(response.statusCode).toEqual(400);
        });
    });
})

afterAll(async function() {
    await db.end();
});