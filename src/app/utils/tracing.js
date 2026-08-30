import { trace } from '@opentelemetry/api';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const initTracing = () => {
  try {
    const provider = new WebTracerProvider({
      resource: resourceFromAttributes({
        'service.name': 'sgpj-frontend',
        'service.version': '1.0.0',
        'deployment.environment': import.meta.env.MODE || 'development'
      })
    });

    const exporter = new OTLPTraceExporter({
      url: import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT || 'http://observability:4318/v1/traces',
      headers: {}
    });

    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
    provider.register();

    registerInstrumentations({
      instrumentations: [
        getWebAutoInstrumentations({
          '@opentelemetry/instrumentation-fetch': {
            enabled: true,
            propagateTraceParentHeaders: true
          },
          '@opentelemetry/instrumentation-user-interaction': {
            enabled: true,
            eventNames: ['click', 'submit', 'change']
          }
        })
      ]
    });

    console.log('OpenTelemetry tracing initialized');
  } catch (error) {
    console.error('Failed to initialize OpenTelemetry tracing:', error);
  }
};

export const tracer = trace.getTracer('sgpj-frontend');
export default initTracing;