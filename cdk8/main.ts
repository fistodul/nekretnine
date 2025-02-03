import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';

import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

import {
  KubeDeployment,
  KubeService,
  KubeConfigMap,
  IntOrString
} from './imports/k8s';

// Load the .env file from ../.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

export class NekretnineChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = {}) {
    super(scope, id, props);

    // Create a ConfigMap to hold the SQL initialization scripts (without PersistentVolume)
    const sqlConfigMap = new KubeConfigMap(this, `${id}-sql-configmap`, {
      data: {
        'a.sql': fs.readFileSync(path.join(__dirname, '..', 'compose', 'nekretnine.sql')).toString(),
        'b.sql': fs.readFileSync(path.join(__dirname, '..', 'compose', 'data.sql')).toString()
      }
    });

    // Define the database (MariaDB) deployment
    new KubeDeployment(this, 'db-deployment', {
      spec: {
        replicas: 1,
        selector: {
          matchLabels: { app: `${id}-db` }
        },
        template: {
          metadata: { labels: { app: `${id}-db` } },
          spec: {
            containers: [
              {
                name: 'db',
                image: 'mariadb',
                ports: [{ containerPort: Number(process.env.DB_PORT) || 3306 }],
                env: [
                  { name: 'MARIADB_USER', value: process.env.DB_USER || 'testuser123' },
                  { name: 'MARIADB_PASSWORD', value: process.env.DB_PASS || 'testpass123' },
                  { name: 'MARIADB_DATABASE', value: process.env.DB_DB || 'nekretnine' },
                  { name: 'MARIADB_RANDOM_ROOT_PASSWORD', value: '1' }
                ],
                livenessProbe: {
                  exec: {
                    command: [
                      'healthcheck.sh',
                      '--su-mysql',
                      '--connect',
                      '--innodb_initialized'
                    ]
                  },
                  initialDelaySeconds: 15,
                  periodSeconds: 15,
                  timeoutSeconds: 30,
                  failureThreshold: 3
                },
                volumeMounts: [
                  {
                    name: 'init-sql',
                    mountPath: '/docker-entrypoint-initdb.d'
                  }
                ]
              }
            ],
            volumes: [
              {
                name: 'init-sql',
                configMap: {
                  // Use the name from the ConfigMap resource
                  name: sqlConfigMap.name
                }
              }
            ]
          }
        }
      }
    });

    // Service for the database – accessible only inside the cluster
    new KubeService(this, 'db-service', {
      spec: {
        type: 'ClusterIP',
        ports: [
          { port: 3306, targetPort: IntOrString.fromNumber(3306) }
        ],
        selector: { app: `${id}-db` }
      }
    });

    // Define the web application deployment
    new KubeDeployment(this, 'web-deployment', {
      spec: {
        replicas: 1,
        selector: {
          matchLabels: { app: `${id}-web` }
        },
        template: {
          metadata: { labels: { app: `${id}-web` } },
          spec: {
            containers: [
              {
                name: 'web',
                image: 'filipmania/nekretnine',
                ports: [{ containerPort: Number(process.env.WEB_PORT) || 8000 }],
                env: [
                  { name: 'NODE_ENV', value: process.env.NODE_ENV || 'production' },
                  { name: 'DB_HOST', value: process.env.DB_HOST || 'db' },
                  { name: 'DB_USER', value: process.env.DB_USER || 'testuser123' },
                  { name: 'DB_PASS', value: process.env.DB_PASS || 'testpass123' },
                  { name: 'DB_DB', value: process.env.DB_DB || 'nekretnine' },
                  { name: 'DB_PORT', value: process.env.DB_PORT || '3306' },
                  { name: 'COOKIE_SECRET', value: process.env.COOKIE_SECRET || 'testcookie123' },
                  { name: 'WEB_PASS', value: process.env.WEB_PASS || 'testpass123' },
                  { name: 'WEB_PORT', value: process.env.WEB_PORT || '8000' }
                ]
              }
            ]
          }
        }
      }
    });

    // Service for the web deployment – exposing it externally via a LoadBalancer
    new KubeService(this, 'web-service', {
      spec: {
        type: 'LoadBalancer',
        ports: [
          { port: 8000, targetPort: IntOrString.fromNumber(8000) }
        ],
        selector: { app: `${id}-web` }
      }
    });

  }
}

// Instantiate the app and synthesize the Kubernetes manifests
const app = new App();
new NekretnineChart(app, 'nekretnine');
app.synth();
