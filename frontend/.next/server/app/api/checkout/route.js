/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/checkout/route";
exports.ids = ["app/api/checkout/route"];
exports.modules = {

/***/ "(rsc)/./app/api/checkout/route.ts":
/*!***********************************!*\
  !*** ./app/api/checkout/route.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _utils_supabase__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/supabase */ \"(rsc)/./utils/supabase.ts\");\n/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! axios */ \"(rsc)/./node_modules/axios/lib/axios.js\");\n\n\n\nasync function POST(request) {\n    // Check authentication using Supabase\n    const session = await (0,_utils_supabase__WEBPACK_IMPORTED_MODULE_1__.getSession)();\n    if (!session || !session.user) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Unauthorized'\n        }, {\n            status: 401\n        });\n    }\n    try {\n        // Get the plan ID from the request body\n        const { planId } = await request.json();\n        if (!planId) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Missing plan ID'\n            }, {\n                status: 400\n            });\n        }\n        // Get the backend API URL from environment variables\n        const apiUrl = \"https://upscaloro.onrender.com\" || 0;\n        // Forward the request to the backend to create a checkout session\n        const response = await axios__WEBPACK_IMPORTED_MODULE_2__[\"default\"].post(`${apiUrl}/api/checkout`, {\n            plan_id: planId\n        }, {\n            headers: {\n                'Authorization': `Bearer ${session.access_token}`,\n                'Content-Type': 'application/json'\n            }\n        });\n        // Return the checkout session details\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(response.data);\n    } catch (error) {\n        console.error('Error creating checkout session:', error);\n        // Return an error response\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Failed to create checkout session',\n            details: error.response?.data || error.message\n        }, {\n            status: error.response?.status || 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2NoZWNrb3V0L3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBd0Q7QUFDVjtBQUNwQjtBQUVuQixlQUFlRyxLQUFLQyxPQUFvQjtJQUM3QyxzQ0FBc0M7SUFDdEMsTUFBTUMsVUFBVSxNQUFNSiwyREFBVUE7SUFDaEMsSUFBSSxDQUFDSSxXQUFXLENBQUNBLFFBQVFDLElBQUksRUFBRTtRQUM3QixPQUFPTixxREFBWUEsQ0FBQ08sSUFBSSxDQUFDO1lBQUVDLE9BQU87UUFBZSxHQUFHO1lBQUVDLFFBQVE7UUFBSTtJQUNwRTtJQUVBLElBQUk7UUFDRix3Q0FBd0M7UUFDeEMsTUFBTSxFQUFFQyxNQUFNLEVBQUUsR0FBRyxNQUFNTixRQUFRRyxJQUFJO1FBQ3JDLElBQUksQ0FBQ0csUUFBUTtZQUNYLE9BQU9WLHFEQUFZQSxDQUFDTyxJQUFJLENBQUM7Z0JBQUVDLE9BQU87WUFBa0IsR0FBRztnQkFBRUMsUUFBUTtZQUFJO1FBQ3ZFO1FBRUEscURBQXFEO1FBQ3JELE1BQU1FLFNBQVNDLGdDQUErQixJQUFJLENBQXVCO1FBRXpFLGtFQUFrRTtRQUNsRSxNQUFNRyxXQUFXLE1BQU1iLDZDQUFLQSxDQUFDYyxJQUFJLENBQy9CLEdBQUdMLE9BQU8sYUFBYSxDQUFDLEVBQ3hCO1lBQUVNLFNBQVNQO1FBQU8sR0FDbEI7WUFDRVEsU0FBUztnQkFDUCxpQkFBaUIsQ0FBQyxPQUFPLEVBQUViLFFBQVFjLFlBQVksRUFBRTtnQkFDakQsZ0JBQWdCO1lBQ2xCO1FBQ0Y7UUFHRixzQ0FBc0M7UUFDdEMsT0FBT25CLHFEQUFZQSxDQUFDTyxJQUFJLENBQUNRLFNBQVNLLElBQUk7SUFDeEMsRUFBRSxPQUFPWixPQUFZO1FBQ25CYSxRQUFRYixLQUFLLENBQUMsb0NBQW9DQTtRQUVsRCwyQkFBMkI7UUFDM0IsT0FBT1IscURBQVlBLENBQUNPLElBQUksQ0FDdEI7WUFDRUMsT0FBTztZQUNQYyxTQUFTZCxNQUFNTyxRQUFRLEVBQUVLLFFBQVFaLE1BQU1lLE9BQU87UUFDaEQsR0FDQTtZQUFFZCxRQUFRRCxNQUFNTyxRQUFRLEVBQUVOLFVBQVU7UUFBSTtJQUU1QztBQUNGIiwic291cmNlcyI6WyIvVXNlcnMvYnVzaW5lc3NsYXB0b3AvRG9jdW1lbnRzL1Vwc2NhbG9yby9mcm9udGVuZC9hcHAvYXBpL2NoZWNrb3V0L3JvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcic7XG5pbXBvcnQgeyBnZXRTZXNzaW9uIH0gZnJvbSAnQC91dGlscy9zdXBhYmFzZSc7XG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXF1ZXN0OiBOZXh0UmVxdWVzdCkge1xuICAvLyBDaGVjayBhdXRoZW50aWNhdGlvbiB1c2luZyBTdXBhYmFzZVxuICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2Vzc2lvbigpO1xuICBpZiAoIXNlc3Npb24gfHwgIXNlc3Npb24udXNlcikge1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9LCB7IHN0YXR1czogNDAxIH0pO1xuICB9XG5cbiAgdHJ5IHtcbiAgICAvLyBHZXQgdGhlIHBsYW4gSUQgZnJvbSB0aGUgcmVxdWVzdCBib2R5XG4gICAgY29uc3QgeyBwbGFuSWQgfSA9IGF3YWl0IHJlcXVlc3QuanNvbigpO1xuICAgIGlmICghcGxhbklkKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ01pc3NpbmcgcGxhbiBJRCcgfSwgeyBzdGF0dXM6IDQwMCB9KTtcbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIGJhY2tlbmQgQVBJIFVSTCBmcm9tIGVudmlyb25tZW50IHZhcmlhYmxlc1xuICAgIGNvbnN0IGFwaVVybCA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX0FQSV9VUkwgfHwgJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMCc7XG4gICAgXG4gICAgLy8gRm9yd2FyZCB0aGUgcmVxdWVzdCB0byB0aGUgYmFja2VuZCB0byBjcmVhdGUgYSBjaGVja291dCBzZXNzaW9uXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5wb3N0KFxuICAgICAgYCR7YXBpVXJsfS9hcGkvY2hlY2tvdXRgLFxuICAgICAgeyBwbGFuX2lkOiBwbGFuSWQgfSxcbiAgICAgIHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke3Nlc3Npb24uYWNjZXNzX3Rva2VufWAsXG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gUmV0dXJuIHRoZSBjaGVja291dCBzZXNzaW9uIGRldGFpbHNcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24ocmVzcG9uc2UuZGF0YSk7XG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBjaGVja291dCBzZXNzaW9uOicsIGVycm9yKTtcbiAgICBcbiAgICAvLyBSZXR1cm4gYW4gZXJyb3IgcmVzcG9uc2VcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICB7IFxuICAgICAgICBlcnJvcjogJ0ZhaWxlZCB0byBjcmVhdGUgY2hlY2tvdXQgc2Vzc2lvbicsXG4gICAgICAgIGRldGFpbHM6IGVycm9yLnJlc3BvbnNlPy5kYXRhIHx8IGVycm9yLm1lc3NhZ2UgXG4gICAgICB9LCBcbiAgICAgIHsgc3RhdHVzOiBlcnJvci5yZXNwb25zZT8uc3RhdHVzIHx8IDUwMCB9XG4gICAgKTtcbiAgfVxufSAiXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiZ2V0U2Vzc2lvbiIsImF4aW9zIiwiUE9TVCIsInJlcXVlc3QiLCJzZXNzaW9uIiwidXNlciIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsInBsYW5JZCIsImFwaVVybCIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19BUElfVVJMIiwicmVzcG9uc2UiLCJwb3N0IiwicGxhbl9pZCIsImhlYWRlcnMiLCJhY2Nlc3NfdG9rZW4iLCJkYXRhIiwiY29uc29sZSIsImRldGFpbHMiLCJtZXNzYWdlIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/checkout/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcheckout%2Froute&page=%2Fapi%2Fcheckout%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcheckout%2Froute.ts&appDir=%2FUsers%2Fbusinesslaptop%2FDocuments%2FUpscaloro%2Ffrontend%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fbusinesslaptop%2FDocuments%2FUpscaloro%2Ffrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcheckout%2Froute&page=%2Fapi%2Fcheckout%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcheckout%2Froute.ts&appDir=%2FUsers%2Fbusinesslaptop%2FDocuments%2FUpscaloro%2Ffrontend%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fbusinesslaptop%2FDocuments%2FUpscaloro%2Ffrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_businesslaptop_Documents_Upscaloro_frontend_app_api_checkout_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/checkout/route.ts */ \"(rsc)/./app/api/checkout/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/checkout/route\",\n        pathname: \"/api/checkout\",\n        filename: \"route\",\n        bundlePath: \"app/api/checkout/route\"\n    },\n    resolvedPagePath: \"/Users/businesslaptop/Documents/Upscaloro/frontend/app/api/checkout/route.ts\",\n    nextConfigOutput,\n    userland: _Users_businesslaptop_Documents_Upscaloro_frontend_app_api_checkout_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZjaGVja291dCUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGY2hlY2tvdXQlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZjaGVja291dCUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRmJ1c2luZXNzbGFwdG9wJTJGRG9jdW1lbnRzJTJGVXBzY2Fsb3JvJTJGZnJvbnRlbmQlMkZhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPSUyRlVzZXJzJTJGYnVzaW5lc3NsYXB0b3AlMkZEb2N1bWVudHMlMkZVcHNjYWxvcm8lMkZmcm9udGVuZCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDNEI7QUFDekc7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9Vc2Vycy9idXNpbmVzc2xhcHRvcC9Eb2N1bWVudHMvVXBzY2Fsb3JvL2Zyb250ZW5kL2FwcC9hcGkvY2hlY2tvdXQvcm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2NoZWNrb3V0L3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvY2hlY2tvdXRcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2NoZWNrb3V0L3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL1VzZXJzL2J1c2luZXNzbGFwdG9wL0RvY3VtZW50cy9VcHNjYWxvcm8vZnJvbnRlbmQvYXBwL2FwaS9jaGVja291dC9yb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcheckout%2Froute&page=%2Fapi%2Fcheckout%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcheckout%2Froute.ts&appDir=%2FUsers%2Fbusinesslaptop%2FDocuments%2FUpscaloro%2Ffrontend%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fbusinesslaptop%2FDocuments%2FUpscaloro%2Ffrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(rsc)/./utils/supabase.ts":
/*!***************************!*\
  !*** ./utils/supabase.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getCurrentUser: () => (/* binding */ getCurrentUser),\n/* harmony export */   getSession: () => (/* binding */ getSession),\n/* harmony export */   signIn: () => (/* binding */ signIn),\n/* harmony export */   signOut: () => (/* binding */ signOut),\n/* harmony export */   signUp: () => (/* binding */ signUp),\n/* harmony export */   supabase: () => (/* binding */ supabase)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n\nconst supabaseUrl = \"https://nvcnmsbwydecixpvnecy.supabase.co\" || 0;\nconst supabaseAnonKey = \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52Y25tc2J3eWRlY2l4cHZuZWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2ODgxMTksImV4cCI6MjA1NjI2NDExOX0.XP16GYF9ADll2LopFv1jT_QWoQC53pCSr0evsiTOqyQ\" || 0;\nif (!supabaseUrl || !supabaseAnonKey) {\n    console.error('Missing Supabase environment variables. Please check your .env file.');\n}\nconst supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(supabaseUrl, supabaseAnonKey);\n// Authentication helper functions\nconst signUp = async (email, password)=>{\n    const { data, error } = await supabase.auth.signUp({\n        email,\n        password\n    });\n    return {\n        data,\n        error\n    };\n};\nconst signIn = async (email, password)=>{\n    const { data, error } = await supabase.auth.signInWithPassword({\n        email,\n        password\n    });\n    return {\n        data,\n        error\n    };\n};\nconst signOut = async ()=>{\n    const { error } = await supabase.auth.signOut();\n    return {\n        error\n    };\n};\nconst getCurrentUser = async ()=>{\n    const { data: { user } } = await supabase.auth.getUser();\n    return user;\n};\nconst getSession = async ()=>{\n    const { data: { session } } = await supabase.auth.getSession();\n    return session;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi91dGlscy9zdXBhYmFzZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQXFEO0FBRXJELE1BQU1DLGNBQWNDLDBDQUFvQyxJQUFJLENBQUU7QUFDOUQsTUFBTUcsa0JBQWtCSCxrTkFBeUMsSUFBSSxDQUFFO0FBRXZFLElBQUksQ0FBQ0QsZUFBZSxDQUFDSSxpQkFBaUI7SUFDcENFLFFBQVFDLEtBQUssQ0FBQztBQUNoQjtBQUVPLE1BQU1DLFdBQVdULG1FQUFZQSxDQUFDQyxhQUFhSSxpQkFBaUI7QUFFbkUsa0NBQWtDO0FBQzNCLE1BQU1LLFNBQVMsT0FBT0MsT0FBZUM7SUFDMUMsTUFBTSxFQUFFQyxJQUFJLEVBQUVMLEtBQUssRUFBRSxHQUFHLE1BQU1DLFNBQVNLLElBQUksQ0FBQ0osTUFBTSxDQUFDO1FBQ2pEQztRQUNBQztJQUNGO0lBQ0EsT0FBTztRQUFFQztRQUFNTDtJQUFNO0FBQ3ZCLEVBQUU7QUFFSyxNQUFNTyxTQUFTLE9BQU9KLE9BQWVDO0lBQzFDLE1BQU0sRUFBRUMsSUFBSSxFQUFFTCxLQUFLLEVBQUUsR0FBRyxNQUFNQyxTQUFTSyxJQUFJLENBQUNFLGtCQUFrQixDQUFDO1FBQzdETDtRQUNBQztJQUNGO0lBQ0EsT0FBTztRQUFFQztRQUFNTDtJQUFNO0FBQ3ZCLEVBQUU7QUFFSyxNQUFNUyxVQUFVO0lBQ3JCLE1BQU0sRUFBRVQsS0FBSyxFQUFFLEdBQUcsTUFBTUMsU0FBU0ssSUFBSSxDQUFDRyxPQUFPO0lBQzdDLE9BQU87UUFBRVQ7SUFBTTtBQUNqQixFQUFFO0FBRUssTUFBTVUsaUJBQWlCO0lBQzVCLE1BQU0sRUFBRUwsTUFBTSxFQUFFTSxJQUFJLEVBQUUsRUFBRSxHQUFHLE1BQU1WLFNBQVNLLElBQUksQ0FBQ00sT0FBTztJQUN0RCxPQUFPRDtBQUNULEVBQUU7QUFFSyxNQUFNRSxhQUFhO0lBQ3hCLE1BQU0sRUFBRVIsTUFBTSxFQUFFUyxPQUFPLEVBQUUsRUFBRSxHQUFHLE1BQU1iLFNBQVNLLElBQUksQ0FBQ08sVUFBVTtJQUM1RCxPQUFPQztBQUNULEVBQUUiLCJzb3VyY2VzIjpbIi9Vc2Vycy9idXNpbmVzc2xhcHRvcC9Eb2N1bWVudHMvVXBzY2Fsb3JvL2Zyb250ZW5kL3V0aWxzL3N1cGFiYXNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyc7XG5cbmNvbnN0IHN1cGFiYXNlVXJsID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIHx8ICcnO1xuY29uc3Qgc3VwYWJhc2VBbm9uS2V5ID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkgfHwgJyc7XG5cbmlmICghc3VwYWJhc2VVcmwgfHwgIXN1cGFiYXNlQW5vbktleSkge1xuICBjb25zb2xlLmVycm9yKCdNaXNzaW5nIFN1cGFiYXNlIGVudmlyb25tZW50IHZhcmlhYmxlcy4gUGxlYXNlIGNoZWNrIHlvdXIgLmVudiBmaWxlLicpO1xufVxuXG5leHBvcnQgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoc3VwYWJhc2VVcmwsIHN1cGFiYXNlQW5vbktleSk7XG5cbi8vIEF1dGhlbnRpY2F0aW9uIGhlbHBlciBmdW5jdGlvbnNcbmV4cG9ydCBjb25zdCBzaWduVXAgPSBhc3luYyAoZW1haWw6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZykgPT4ge1xuICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLnNpZ25VcCh7XG4gICAgZW1haWwsXG4gICAgcGFzc3dvcmQsXG4gIH0pO1xuICByZXR1cm4geyBkYXRhLCBlcnJvciB9O1xufTtcblxuZXhwb3J0IGNvbnN0IHNpZ25JbiA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguc2lnbkluV2l0aFBhc3N3b3JkKHtcbiAgICBlbWFpbCxcbiAgICBwYXNzd29yZCxcbiAgfSk7XG4gIHJldHVybiB7IGRhdGEsIGVycm9yIH07XG59O1xuXG5leHBvcnQgY29uc3Qgc2lnbk91dCA9IGFzeW5jICgpID0+IHtcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5zaWduT3V0KCk7XG4gIHJldHVybiB7IGVycm9yIH07XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0Q3VycmVudFVzZXIgPSBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpO1xuICByZXR1cm4gdXNlcjtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRTZXNzaW9uID0gYXN5bmMgKCkgPT4ge1xuICBjb25zdCB7IGRhdGE6IHsgc2Vzc2lvbiB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFNlc3Npb24oKTtcbiAgcmV0dXJuIHNlc3Npb247XG59OyAiXSwibmFtZXMiOlsiY3JlYXRlQ2xpZW50Iiwic3VwYWJhc2VVcmwiLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIiwic3VwYWJhc2VBbm9uS2V5IiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkiLCJjb25zb2xlIiwiZXJyb3IiLCJzdXBhYmFzZSIsInNpZ25VcCIsImVtYWlsIiwicGFzc3dvcmQiLCJkYXRhIiwiYXV0aCIsInNpZ25JbiIsInNpZ25JbldpdGhQYXNzd29yZCIsInNpZ25PdXQiLCJnZXRDdXJyZW50VXNlciIsInVzZXIiLCJnZXRVc2VyIiwiZ2V0U2Vzc2lvbiIsInNlc3Npb24iXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./utils/supabase.ts\n");

/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "tls":
/*!**********************!*\
  !*** external "tls" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ "tty":
/*!**********************!*\
  !*** external "tty" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tty");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/mime-db","vendor-chunks/axios","vendor-chunks/whatwg-url","vendor-chunks/follow-redirects","vendor-chunks/debug","vendor-chunks/get-intrinsic","vendor-chunks/form-data","vendor-chunks/asynckit","vendor-chunks/webidl-conversions","vendor-chunks/combined-stream","vendor-chunks/mime-types","vendor-chunks/proxy-from-env","vendor-chunks/ms","vendor-chunks/supports-color","vendor-chunks/has-symbols","vendor-chunks/delayed-stream","vendor-chunks/function-bind","vendor-chunks/es-set-tostringtag","vendor-chunks/get-proto","vendor-chunks/call-bind-apply-helpers","vendor-chunks/dunder-proto","vendor-chunks/math-intrinsics","vendor-chunks/es-errors","vendor-chunks/has-flag","vendor-chunks/gopd","vendor-chunks/es-define-property","vendor-chunks/hasown","vendor-chunks/has-tostringtag","vendor-chunks/es-object-atoms"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcheckout%2Froute&page=%2Fapi%2Fcheckout%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcheckout%2Froute.ts&appDir=%2FUsers%2Fbusinesslaptop%2FDocuments%2FUpscaloro%2Ffrontend%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fbusinesslaptop%2FDocuments%2FUpscaloro%2Ffrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();