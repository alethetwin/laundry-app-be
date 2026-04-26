import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import packageJson from '../package.json' with { type: 'json' };

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const config = new DocumentBuilder()
        .setTitle('Laundry App Backend API')
        .setDescription('The laundry app backend API description')
        .setVersion(packageJson.version)
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter JWT token without "Bearer " prefix',
            },
            'access-token',
        )
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    app.getHttpAdapter().get('/openapi.json', (req, res) => {
        res.json(documentFactory());
    });
    await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
