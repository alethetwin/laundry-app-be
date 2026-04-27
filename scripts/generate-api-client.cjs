#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '../api-client');
const PACKAGE_NAME = '@alethetwin/laundry-app-api-client';
const PACKAGE_VERSION = require('../package.json').version;

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Download OpenAPI spec
function downloadOpenApiSpec() {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(
            path.join(OUTPUT_DIR, 'openapi.json'),
        );
        const url = new URL(`${API_BASE_URL}/openapi.json`);
        const client = url.protocol === 'https:' ? https : require('http');

        client
            .get(url, (response) => {
                if (response.statusCode !== 200) {
                    reject(
                        new Error(
                            `Failed to download OpenAPI spec: ${response.statusCode}`,
                        ),
                    );
                    return;
                }

                response.pipe(file);

                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            })
            .on('error', (err) => {
                fs.unlink(path.join(OUTPUT_DIR, 'openapi.json'), () => {});
                console.error('Download error:', err.message);
                reject(err);
            });
    });
}
// test

// Generate TypeScript types from OpenAPI spec
function generateTypes() {
    const openApiSpec = JSON.parse(
        fs.readFileSync(path.join(OUTPUT_DIR, 'openapi.json'), 'utf8'),
    );

    // Extract schemas
    const schemas = openApiSpec.components?.schemas || {};

    let typesContent = `// Generated TypeScript types for Laundry App API
// Generated on: ${new Date().toISOString()}

export interface ApiError {
    error?: string;
    message?: string;
    statusCode?: number;
}

`;

    // Generate interfaces for schemas
    Object.entries(schemas).forEach(([schemaName, schema]) => {
        typesContent += generateInterface(schemaName, schema);
    });

    // Generate API client interface
    typesContent += generateApiClientInterface(openApiSpec);

    fs.writeFileSync(path.join(OUTPUT_DIR, 'types.ts'), typesContent);
}

function generateInterface(name, schema) {
    let content = `export interface ${capitalizeFirstLetter(name)} {\n`;

    if (schema.properties) {
        Object.entries(schema.properties).forEach(([propName, prop]) => {
            const required = schema.required?.includes(propName);
            const optional = required ? '' : '?';
            const type = getTsType(prop);
            content += `  ${propName}${optional}: ${type};\n`;
        });
    }

    content += `}\n\n`;
    return content;
}

function getTsType(prop) {
    if (prop.$ref) {
        return prop.$ref.split('/').pop();
    }

    if (prop.enum) {
        return prop.enum.map((v) => `'${v}'`).join(' | ');
    }

    switch (prop.type) {
        case 'string':
            return 'string';
        case 'number':
        case 'integer':
            return 'number';
        case 'boolean':
            return 'boolean';
        case 'array':
            const itemType = getTsType(prop.items);
            return `${itemType}[]`;
        case 'object':
            return 'Record<string, any>';
        default:
            return 'any';
    }
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateApiClientInterface(openApiSpec) {
    const paths = openApiSpec.paths || {};

    let content = `// API Client Configuration
export interface ApiClientConfig {
    baseURL?: string;
    apiKey?: string;
    timeout?: number;
}

// Main API Client class
export class LaundryAppApiClient {
    private baseURL: string;
    private apiKey?: string;
    private timeout: number;

    constructor(config: ApiClientConfig = {}) {
        this.baseURL = config.baseURL || '${API_BASE_URL}';
        this.apiKey = config.apiKey;
        this.timeout = config.timeout || 10000;
    }

    // Set or update the API key
    setApiKey(apiKey: string): void {
        this.apiKey = apiKey;
    }

    // Get current API key
    getApiKey(): string | undefined {
        return this.apiKey;
    }

    // Update base URL
    setBaseURL(baseURL: string): void {
        this.baseURL = baseURL;
    }

    private async request<T>(
        path: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = \`\${this.baseURL}\${path}\`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        };

        if (this.apiKey) {
            headers.Authorization = \`Bearer \${this.apiKey}\`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || \`HTTP \${response.status}\`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
`;

    // Group endpoints by controller/tag
    const controllerGroups = {};

    Object.entries(paths).forEach(([path, pathItem]) => {
        Object.entries(pathItem).forEach(([method, operation]) => {
            if (method === 'parameters' || method === 'summary') return;

            // Get controller name from tags or path
            const tags = operation.tags || [];
            let controllerName = 'default';

            if (tags.length > 0) {
                controllerName = tags[0].toLowerCase();
            } else {
                // Extract from path (e.g., /auth/login -> auth)
                const pathParts = path
                    .split('/')
                    .filter((p) => p && !p.startsWith('{'));
                if (pathParts.length > 0) {
                    controllerName = pathParts[0].toLowerCase();
                }
            }

            if (!controllerGroups[controllerName]) {
                controllerGroups[controllerName] = [];
            }

            const methodName = getMethodName(
                operation.operationId,
                path,
                method,
            );
            const parameters = getParameters(operation);
            const requestBody = getRequestBody(operation);
            const responseType = getResponseType(operation);

            const pathTemplate = path.replace(/{[^}]+}/g, (match) => {
                const paramName = match.slice(1, -1);
                return '${' + paramName + '}';
            });

            controllerGroups[controllerName].push({
                methodName,
                parameters,
                requestBody,
                responseType,
                pathTemplate,
                method: method.toUpperCase(),
                description:
                    operation.summary ||
                    operation.description ||
                    `${method.toUpperCase()} ${path}`,
                path,
            });
        });
    });

    // Generate nested controller objects
    Object.entries(controllerGroups).forEach(([controllerName, methods]) => {
        content += `
    // ${capitalizeFirstLetter(controllerName)} controller methods
    ${controllerName}: {`;

        methods.forEach((method) => {
            content += `
        // ${method.description}
        async ${method.methodName}(${method.parameters}): Promise<${method.responseType}> {
            return this.request<${method.responseType}>(\`\${this.baseURL}${method.pathTemplate}\`, {
                method: '${method.method}',
                ${method.requestBody ? `body: JSON.stringify(${method.requestBody}),` : ''}
            });
        },`;
        });

        content += `
    },`;
    });

    content += `
}

// Factory function for easy instantiation
export function createApiClient(config?: ApiClientConfig): LaundryAppApiClient {
    return new LaundryAppApiClient(config);
}

// Export default client
export default LaundryAppApiClient;
`;

    return content;
}

function getMethodName(operationId, path, method) {
    // Use operationId if available, clean it up
    if (operationId) {
        // Remove controller prefix and clean up
        const cleanName = operationId.replace(/[^a-zA-Z0-9]/g, '');

        // If operationId contains controller name, extract just the method part
        const controllerMatch = cleanName.match(/^(.+?)([A-Z][a-z]+.*)$/);
        if (controllerMatch) {
            return controllerMatch[2];
        }

        return cleanName;
    }

    // Generate method name from path and HTTP method
    const pathParts = path.split('/').filter((p) => p && !p.startsWith('{'));

    // Remove first part (controller) and use the rest
    const methodParts = pathParts.slice(1);

    if (methodParts.length > 0) {
        const pathName = methodParts
            .map((p) => capitalizeFirstLetter(p))
            .join('');
        return method.toLowerCase() + capitalizeFirstLetter(pathName);
    }

    // Fallback to just method name
    return method.toLowerCase();
}

function getParameters(operation) {
    const params = [];

    if (operation.parameters) {
        operation.parameters.forEach((param) => {
            if (param.in === 'path') {
                params.push(`${param.name}: string | number`);
            }
        });
    }

    // Add request body parameter if present
    if (operation.requestBody?.content?.['application/json']?.schema) {
        params.push('data: any');
    }

    return params.join(', ');
}

function getRequestBody(operation) {
    if (operation.requestBody?.content?.['application/json']?.schema) {
        return 'data';
    }
    return null;
}

function getResponseType(operation) {
    const responses = operation.responses || {};
    const successResponse =
        responses['200'] || responses['201'] || responses['204'];

    if (successResponse?.content?.['application/json']?.schema) {
        const schema = successResponse.content['application/json'].schema;
        if (schema.$ref) {
            return schema.$ref.split('/').pop();
        }
        if (schema.type === 'array' && schema.items?.$ref) {
            return `${schema.items.$ref.split('/').pop()}[]`;
        }
    }

    return 'any';
}

// Generate package.json for the API client
function generatePackageJson() {
    const packageJson = {
        name: PACKAGE_NAME,
        version: PACKAGE_VERSION,
        description: 'TypeScript API client for Laundry App Backend',
        main: 'index.js',
        types: 'types.ts',
        scripts: {
            build: 'tsc',
            prepublishOnly: 'npm run build',
        },
        keywords: ['api', 'client', 'typescript', 'laundry-app'],
        author: '',
        license: 'UNLICENSED',
        dependencies: {},
        devDependencies: {
            typescript: '^5.0.0',
            '@types/node': '^20.0.0',
        },
        files: ['types.ts', 'index.js', 'README.md'],
        repository: {
            type: 'git',
            url: 'git+https://github.com/AleTheTwin/laundry-app-be.git',
            directory: 'api-client',
        },
    };

    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'package.json'),
        JSON.stringify(packageJson, null, 2),
    );
}

// Generate index.ts (main entry point)
function generateIndexTs() {
    const indexContent = `// Main entry point for Laundry App API Client
export * from './types';
import { LaundryAppApiClient, createApiClient } from './types';
export { LaundryAppApiClient, createApiClient };
export default LaundryAppApiClient;
`;

    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.ts'), indexContent);
}

// Generate README.md
function generateReadme() {
    const readmeContent = `# Laundry App API Client

TypeScript API client for the Laundry App Backend.

## Installation

\`\`\`bash
npm install @alethetwin/laundry-app-api-client
\`\`\`

## Usage

\`\`\`typescript
import { createApiClient } from '@alethetwin/laundry-app-api-client';

// Initialize the client
const apiClient = createApiClient({
    baseURL: 'https://your-api-url.com',
    apiKey: 'your-jwt-token'
});

// Example: Get user profile
const profile = await apiClient.getProfile();

// Example: Login
const loginResponse = await apiClient.login({
    email: 'user@example.com',
    password: 'password'
});
\`\`\`

## Configuration

The client accepts the following configuration options:

- \`baseURL\`: Base URL of the API (default: http://localhost:3000)
- \`apiKey\`: JWT token for authentication
- \`timeout\`: Request timeout in milliseconds (default: 10000)

## Generated Types

This package includes TypeScript types for all API responses and requests.

## Development

This package is automatically generated from the OpenAPI specification of the Laundry App Backend.
`;

    fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), readmeContent);
}

// Main execution
async function main() {
    try {
        console.log('🚀 Generating API client...');

        // Create output directory if it doesn't exist
        if (!fs.existsSync(OUTPUT_DIR)) {
            console.log('📁 Creating output directory...');
            fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }

        // Check if openapi.json already exists
        if (fs.existsSync(path.join(OUTPUT_DIR, 'openapi.json'))) {
            console.log('📄 Using existing OpenAPI specification...');
        } else {
            console.log('📥 Downloading OpenAPI specification...');
            await downloadOpenApiSpec();
        }

        console.log('🔧 Generating TypeScript types...');
        generateTypes();

        console.log('📦 Generating package configuration...');
        generatePackageJson();
        generateIndexTs();
        generateReadme();

        console.log('✅ API client generated successfully!');
        console.log(`📁 Output directory: ${OUTPUT_DIR}`);
        console.log('📝 To publish: cd api-client && npm publish');
    } catch (error) {
        console.error('❌ Error generating API client:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };
