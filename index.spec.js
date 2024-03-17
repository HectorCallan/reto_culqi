const request = require('supertest');

describe('POST /auth', () => {
    test('Deberia verificar que existe un Endpoint "auth"', async () => {
        const response = await request("localhost:3000").post('/auth').send()
        //expect(response.)
        expect(response.statusCode).toBe(200);
        //console.log(response);
    })
});

describe('POST /auth', function() {
    it('responds with json', function(done) {
      request("localhost:3000")
        .post('/auth')
        .send({
            "txtEmail": "hector.callan@gmail.com",
            "txtCardNumber": "4970110000000062",
            "txtCvv": "123",
            "txtExpYear": "2027",
            "txtExpMonth": "12"
        })
        .set('Accept', '*/*')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
            if (err) return done(err);
            console.log(res.body);
            return done();
        });
    });
});

describe('GET /getUserInformation', function() {
    it('Probar que sin enviar una correcta autorizacion, no se obtiene informacion de la tarjeta', function() {
        return request("localhost:3000")
            .get('/getUserInformation')
            .set('Authorization', '')
            .expect(200)
            .then(response => {
                expect(response.text).toEqual('Access denied');
                //expect(response.body).toEqual('Access denied');
            })
    });
});
