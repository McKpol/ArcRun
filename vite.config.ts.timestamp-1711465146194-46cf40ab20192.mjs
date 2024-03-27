// vite.config.ts
import { defineConfig } from "file:///C:/Users/McK/Documents/Dokumenty/Projects%20VSC/HTML%20JS%20MONGODB/arcrun/arcrun/node_modules/vite/dist/node/index.js";
import { qwikVite } from "file:///C:/Users/McK/Documents/Dokumenty/Projects%20VSC/HTML%20JS%20MONGODB/arcrun/arcrun/node_modules/@builder.io/qwik/optimizer.mjs";
import { qwikCity } from "file:///C:/Users/McK/Documents/Dokumenty/Projects%20VSC/HTML%20JS%20MONGODB/arcrun/arcrun/node_modules/@builder.io/qwik-city/vite/index.mjs";
import tsconfigPaths from "file:///C:/Users/McK/Documents/Dokumenty/Projects%20VSC/HTML%20JS%20MONGODB/arcrun/arcrun/node_modules/vite-tsconfig-paths/dist/index.mjs";
var vite_config_default = defineConfig(() => {
  return {
    plugins: [qwikCity(), qwikVite(), tsconfigPaths()],
    define: {
      global: {
        appWindow: {
          onFocusChanged: () => {
          },
          isFocused: async () => false,
          hide: async () => {
          },
          show: async () => {
          },
          setFocus: async () => {
          }
        }
      }
    },
    dev: {
      headers: {
        "Cache-Control": "public, max-age=0"
      }
    },
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600"
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNY0tcXFxcRG9jdW1lbnRzXFxcXERva3VtZW50eVxcXFxQcm9qZWN0cyBWU0NcXFxcSFRNTCBKUyBNT05HT0RCXFxcXGFyY3J1blxcXFxhcmNydW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXE1jS1xcXFxEb2N1bWVudHNcXFxcRG9rdW1lbnR5XFxcXFByb2plY3RzIFZTQ1xcXFxIVE1MIEpTIE1PTkdPREJcXFxcYXJjcnVuXFxcXGFyY3J1blxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvTWNLL0RvY3VtZW50cy9Eb2t1bWVudHkvUHJvamVjdHMlMjBWU0MvSFRNTCUyMEpTJTIwTU9OR09EQi9hcmNydW4vYXJjcnVuL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCB7IHF3aWtWaXRlIH0gZnJvbSBcIkBidWlsZGVyLmlvL3F3aWsvb3B0aW1pemVyXCI7XG5pbXBvcnQgeyBxd2lrQ2l0eSB9IGZyb20gXCJAYnVpbGRlci5pby9xd2lrLWNpdHkvdml0ZVwiO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSBcInZpdGUtdHNjb25maWctcGF0aHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCgpID0+IHtcbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbcXdpa0NpdHkoKSwgcXdpa1ZpdGUoKSwgdHNjb25maWdQYXRocygpXSxcbiAgICBkZWZpbmU6IHtcbiAgICAgIGdsb2JhbDoge1xuICAgICAgICBhcHBXaW5kb3c6IHtcbiAgICAgICAgICBvbkZvY3VzQ2hhbmdlZDogKCkgPT4ge30sXG4gICAgICAgICAgaXNGb2N1c2VkOiBhc3luYyAoKSA9PiBmYWxzZSxcbiAgICAgICAgICBoaWRlOiBhc3luYyAoKSA9PiB7fSxcbiAgICAgICAgICBzaG93OiBhc3luYyAoKSA9PiB7fSxcbiAgICAgICAgICBzZXRGb2N1czogYXN5bmMgKCkgPT4ge30sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgZGV2OiB7XG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIFwiQ2FjaGUtQ29udHJvbFwiOiBcInB1YmxpYywgbWF4LWFnZT0wXCIsXG4gICAgICB9LFxuICAgIH0sXG4gICAgcHJldmlldzoge1xuICAgICAgaGVhZGVyczoge1xuICAgICAgICBcIkNhY2hlLUNvbnRyb2xcIjogXCJwdWJsaWMsIG1heC1hZ2U9NjAwXCIsXG4gICAgICB9LFxuICAgIH0sXG4gIH07XG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQTJhLFNBQVMsb0JBQW9CO0FBQ3hjLFNBQVMsZ0JBQWdCO0FBQ3pCLFNBQVMsZ0JBQWdCO0FBQ3pCLE9BQU8sbUJBQW1CO0FBRTFCLElBQU8sc0JBQVEsYUFBYSxNQUFNO0FBQ2hDLFNBQU87QUFBQSxJQUNMLFNBQVMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxHQUFHLGNBQWMsQ0FBQztBQUFBLElBQ2pELFFBQVE7QUFBQSxNQUNOLFFBQVE7QUFBQSxRQUNOLFdBQVc7QUFBQSxVQUNULGdCQUFnQixNQUFNO0FBQUEsVUFBQztBQUFBLFVBQ3ZCLFdBQVcsWUFBWTtBQUFBLFVBQ3ZCLE1BQU0sWUFBWTtBQUFBLFVBQUM7QUFBQSxVQUNuQixNQUFNLFlBQVk7QUFBQSxVQUFDO0FBQUEsVUFDbkIsVUFBVSxZQUFZO0FBQUEsVUFBQztBQUFBLFFBQ3pCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNQLGlCQUFpQjtBQUFBLE1BQ25CO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsU0FBUztBQUFBLFFBQ1AsaUJBQWlCO0FBQUEsTUFDbkI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
