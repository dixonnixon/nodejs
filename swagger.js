const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger_output.json';
const endpointsFiles = [
    './routes/dish.js',
    './routes/leader.js',
    './routes/promo.js'
];

swaggerAutogen(outputFile, endpointsFiles);
