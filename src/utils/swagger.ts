import swaggerJSDoc, { type Options } from 'swagger-jsdoc';

const swaggerJSDocOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sports API Docs',
      description: 'An API to provide sports data from thesports.com',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/**/*.ts', './src/schemas/**/*.ts'],
};

const swaggerDoc = swaggerJSDoc(swaggerJSDocOptions);

export default swaggerDoc;
