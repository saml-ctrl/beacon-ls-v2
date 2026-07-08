import { defineConfig } from 'vite';
import path from 'path';
import fs from 'node:fs';
import lwc from 'vite-plugin-lwc';
import {
  resolveIconTemplatesPlugin,
  iconTemplateExcludeDirs,
  iconTemplateAliases,
} from './vite-plugins/icon-templates.js';

/** LBC ships templates that trip many LWC diagnostics; app code cannot fix those. */
const LBC_UNDER_NODE_MODULES = /node_modules[/\\]lightning-base-components[/\\]/;

function isLightningBaseComponentsLwcRollupWarning(warning) {
  const locFile = warning.loc?.file ?? '';
  const id = warning.id ?? '';
  const message = warning.message ?? '';
  return (
    LBC_UNDER_NODE_MODULES.test(String(locFile)) ||
    LBC_UNDER_NODE_MODULES.test(String(id)) ||
    LBC_UNDER_NODE_MODULES.test(String(message))
  );
}

/**
 * Windows fix (belt-and-suspenders alongside scripts/patch-lwc-windows.mjs).
 *
 * Many Lightning Base Components are template-less (e.g. lightning/datatable
 * ships datatable.js but no datatable.html). @lwc/rollup-plugin is supposed to
 * redirect the implicit `./name.html` import to its empty-template virtual
 * module, but on Windows the raw `.html` request leaks through and Vite tries
 * to load the non-existent file — the module graph 404s and the app is stuck
 * at "Loading…". This plugin front-runs resolution (enforce: 'pre'): when a
 * same-name `.html` template import has no file on disk, it resolves to a
 * virtual module that exports the same empty template the LWC plugin would.
 * On POSIX it simply mirrors the built-in behavior and is harmless.
 */
function implicitLwcTemplateFallbackPlugin() {
  const VIRTUAL_ID = '\0lwc-implicit-empty-template.js';
  let root = process.cwd();
  return {
    name: 'implicit-lwc-template-fallback',
    enforce: 'pre',
    configResolved(config) {
      root = config.root;
    },
    resolveId(source, importer) {
      if (!importer) return null;
      const cleanSource = source.split('?')[0];
      if (!cleanSource.endsWith('.html')) return null;
      const cleanImporter = importer.split('?')[0];
      // Only intercept the implicit same-name template: ./name.html from name.js
      const sourceBase = path.basename(cleanSource, '.html');
      const importerBase = path.basename(cleanImporter, path.extname(cleanImporter));
      if (sourceBase !== importerBase) return null;
      const candidate = cleanSource.startsWith('/')
        ? path.join(root, cleanSource)
        : path.resolve(path.dirname(cleanImporter), cleanSource);
      if (fs.existsSync(candidate)) return null;
      return VIRTUAL_ID;
    },
    load(id) {
      if (id === VIRTUAL_ID) return 'export default void 0;';
      return null;
    },
  };
}

function suppressLbcLwcLoggerNoisePlugin() {
  return {
    name: 'suppress-lbc-lwc-logger-noise',
    configResolved(config) {
      const { logger } = config;
      const origWarn = logger.warn.bind(logger);
      logger.warn = (msg, options) => {
        if (LBC_UNDER_NODE_MODULES.test(String(msg))) return;
        origWarn(msg, options);
      };
      const origWarnOnce = logger.warnOnce.bind(logger);
      logger.warnOnce = (msg, options) => {
        if (LBC_UNDER_NODE_MODULES.test(String(msg))) return;
        origWarnOnce(msg, options);
      };
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [
    implicitLwcTemplateFallbackPlugin(),
    suppressLbcLwcLoggerNoisePlugin(),
    resolveIconTemplatesPlugin(),
    lwc({
      modules: [
        {
          dir: path.resolve('./src/modules'),
        },
        {
          name: '@salesforce/gate/bc.260.enableComboboxElementInternals',
          path: path.resolve('./src/build/shim/gateComboboxElementInternalsClosed.js'),
        },
        {
          npm: 'lightning-base-components',
        },
      ],
      disableSyntheticShadowSupport: false,
      enableDynamicComponents: true,
      exclude: [
        path.resolve('./index.html'),
        /loading\.css/,
        path.resolve('./src/build/generated'),
        // Global SLDS from node_modules (new URL in slds-loader.js) must not pass through LWC:
        // LWC rejects :root in this pipeline when synthetic shadow is enabled.
        /(salesforce-lightning-design-system\.min\.css|slds2\.cosmos\.css)(\?.*)?$/,
        // Global styles loaded via new URL() pattern must also bypass LWC plugin
        /\/styles\/global\.css(\?.*)?$/,
        ...iconTemplateExcludeDirs,
      ],
    }),
  ],
  build: {
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (isLightningBaseComponentsLwcRollupWarning(warning)) return;
        defaultHandler(warning);
      },
    },
  },
  appType: 'spa',
  server: {
    port: 3000,
    open: false,
  },
  optimizeDeps: {
    exclude: ['lightning/modal', 'lightning/toast', 'lightning/toastContainer', 'lightning/showToastEvent', 'lightning/primitiveOverlay', 'lightning/overlayUtils', 'lightning/modalBase', 'lightning/utilsPrivate'],
  },
  resolve: {
    alias: {
      '@salesforce-ux/design-system': path.resolve('./node_modules/@salesforce-ux/design-system'),
      '@salesforce-ux/design-system-2': path.resolve('./node_modules/@salesforce-ux/design-system-2'),
      ...iconTemplateAliases,
    },
  },
});
