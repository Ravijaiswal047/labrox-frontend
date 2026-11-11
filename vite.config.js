import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return defineConfig({
    plugins: [react()],
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "react-redux",
        "@reduxjs/toolkit",
        "axios",
        "moment",
        "react-toastify",
        "nepali-date",
      ],
      exclude: ["xlsx", "exceljs", "jspdf"],
    },
    resolve: {
      alias: {
        "@app": path.resolve(__dirname, "./src"),
        "@store": path.resolve(__dirname, "./src/store"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@modules": path.resolve(__dirname, "./src/modules"),
        "@pages": path.resolve(__dirname, "./src/pages"),
      },
    },
    server: {
       port: 3000,
      proxy: {
        "/api": {
          target: env.VITE_APP_REACT_APP_BASE_URL || "http://localhost:8088",
          changeOrigin: true,
          secure: false,
          headers: {
            Connection: "keep-alive",
          },
        },
        "/reports": {
          target: env.VITE_APP_REACT_APP_BASE_URL || "http://localhost:8088",
          changeOrigin: true,
          secure: false,
          headers: {
            Connection: "keep-alive",
          },
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1500,
      sourcemap: false,
      target: "esnext",
      cssCodeSplit: true,
      cssMinify: true,
      reportCompressedSize: false,
      rollupOptions: {
        treeshake: false,
        output: {
          hoistTransitiveImports: false,
          manualChunks(id) {
            if (!id.includes("node_modules")) return;

            // @emotion and @mui have deep internal circular deps between their
            // sub-packages. Any manual chunk assignment triggers Rollup's
            // linearizer which cannot find a safe const-init order → TDZ.
            // Returning undefined here lets Rollup's natural code-split
            // algorithm handle them, which resolves circular init correctly.
            if (id.includes("@emotion") || id.includes("@mui")) return;

            // PrimeReact
            if (id.includes("primereact") || id.includes("primeicons"))
              return "chunk-prime";

            // Charts (3 chart libs combined ~4 MB)
            if (
              id.includes("apexcharts") ||
              id.includes("react-apexcharts") ||
              id.includes("recharts") ||
              id.includes("chart.js") ||
              id.includes("react-chartjs-2")
            )
              return "chunk-charts";

            // Export / print libraries
            if (
              id.includes("jspdf") ||
              id.includes("exceljs") ||
              id.includes("xlsx") ||
              id.includes("html2pdf") ||
              id.includes("file-saver") ||
              id.includes("qrcode")
            )
              return "chunk-export";

            // Rich-text editors (~5 MB)
            if (
              id.includes("ckeditor4") ||
              id.includes("react-quill") ||
              id.includes("/quill/")
            )
              return "chunk-editor";

            // Icon packs — return undefined so each sub-library
            // (react-icons/fa, react-icons/ri, etc.) becomes its own
            // lazy chunk. Forcing them into one chunk produces a 34 MB
            // upfront download; letting Rollup split them means each
            // ~1.4 MB sub-library loads only when first rendered.
            if (
              id.includes("react-icons") ||
              id.includes("@fortawesome") ||
              id.includes("lucide-react")
            )
              return;

            // Date/time helpers (moment alone is ~300 KB)
            if (
              id.includes("moment") ||
              id.includes("dayjs") ||
              id.includes("luxon")
            )
              return "chunk-date";

            // rc-easyui (~2 MB)
            if (id.includes("rc-easyui")) return "chunk-easyui";

            // Maps, tree views, PDF viewer
            if (
              id.includes("@react-google-maps") ||
              id.includes("react-d3-tree") ||
              id.includes("react-pdf") ||
              id.includes("pdfjs-dist")
            )
              return "chunk-complex";

            // React core + Redux — all in one chunk.
            // react-redux and @reduxjs/toolkit (RTK Query) both access React
            // hooks at module init time. Separate chunks cause race conditions
            // where React is undefined when redux initializes → crash.
            // if (
            //   id.includes("node_modules/react/") ||
            //   id.includes("node_modules/react-dom/") ||
            //   id.includes("node_modules/react-router") ||
            //   id.includes("node_modules/react-redux/") ||
            //   id.includes("node_modules/@reduxjs/") ||
            //   id.includes("node_modules/redux/") ||
            //   id.includes("node_modules/scheduler/")
            // )
            //   return "chunk-react-core";

            // Everything else from node_modules
            return "chunk-vendor";
          },
        },
      },
    },
  });
};
