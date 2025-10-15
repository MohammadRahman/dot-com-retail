// libs/config/src/swagger.config.ts
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(
  app: INestApplication,
  serviceName: string,
  version = '1.0',
) {
  const config = new DocumentBuilder()
    .setTitle(`${serviceName} API`)
    .setDescription(`API documentation for ${serviceName}`)
    .setVersion(version)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
