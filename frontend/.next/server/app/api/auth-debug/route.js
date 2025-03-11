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
exports.id = "app/api/auth-debug/route";
exports.ids = ["app/api/auth-debug/route"];
exports.modules = {

/***/ "(rsc)/./app/api/auth-debug/route.ts":
/*!*************************************!*\
  !*** ./app/api/auth-debug/route.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _utils_supabase__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/supabase */ \"(rsc)/./utils/supabase.ts\");\n\n\nasync function GET(request) {\n    try {\n        console.log(\"Auth debug API called\");\n        // Get Supabase session\n        const session = await (0,_utils_supabase__WEBPACK_IMPORTED_MODULE_1__.getSession)();\n        const user = await (0,_utils_supabase__WEBPACK_IMPORTED_MODULE_1__.getCurrentUser)();\n        // Get session data directly\n        const { data: sessionData } = await _utils_supabase__WEBPACK_IMPORTED_MODULE_1__.supabase.auth.getSession();\n        // Extract cookie names from the request\n        const cookieNames = Object.keys(request.cookies.getAll());\n        const supabaseCookieNames = cookieNames.filter((name)=>name.includes('supabase') || name.includes('sb-'));\n        // Try to refresh the session\n        let refreshResult = null;\n        try {\n            const { data, error } = await _utils_supabase__WEBPACK_IMPORTED_MODULE_1__.supabase.auth.refreshSession();\n            refreshResult = {\n                success: !error,\n                hasSession: !!data.session,\n                hasUser: !!data.user,\n                error: error ? error.message : null\n            };\n            if (!error && data.session) {\n                console.log(\"Session refreshed successfully\");\n            } else if (error) {\n                console.error(\"Session refresh error:\", error);\n            }\n        } catch (refreshError) {\n            console.error(\"Error refreshing session:\", refreshError);\n            refreshResult = {\n                success: false,\n                error: refreshError.message\n            };\n        }\n        // Return detailed authentication information\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            authenticated: !!user,\n            sessionExists: !!session,\n            rawSessionExists: !!sessionData?.session,\n            session: sessionData?.session ? {\n                expiresAt: sessionData.session.expires_at,\n                hasAccessToken: !!sessionData.session.access_token,\n                accessTokenLength: sessionData.session.access_token?.length || 0\n            } : null,\n            user: user ? {\n                id: user.id,\n                email: user.email,\n                emailConfirmed: !!user.email_confirmed_at\n            } : null,\n            supabaseCookies: supabaseCookieNames,\n            allCookies: cookieNames,\n            refreshResult\n        });\n    } catch (error) {\n        console.error('Auth debug error:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            error: 'Error debugging authentication',\n            details: error.message\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgtZGVidWcvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQXdEO0FBQ2dCO0FBRWpFLGVBQWVJLElBQUlDLE9BQW9CO0lBQzVDLElBQUk7UUFDRkMsUUFBUUMsR0FBRyxDQUFDO1FBRVosdUJBQXVCO1FBQ3ZCLE1BQU1DLFVBQVUsTUFBTVAsMkRBQVVBO1FBQ2hDLE1BQU1RLE9BQU8sTUFBTVAsK0RBQWNBO1FBRWpDLDRCQUE0QjtRQUM1QixNQUFNLEVBQUVRLE1BQU1DLFdBQVcsRUFBRSxHQUFHLE1BQU1SLHFEQUFRQSxDQUFDUyxJQUFJLENBQUNYLFVBQVU7UUFFNUQsd0NBQXdDO1FBQ3hDLE1BQU1ZLGNBQWNDLE9BQU9DLElBQUksQ0FBQ1YsUUFBUVcsT0FBTyxDQUFDQyxNQUFNO1FBQ3RELE1BQU1DLHNCQUFzQkwsWUFBWU0sTUFBTSxDQUFDQyxDQUFBQSxPQUM3Q0EsS0FBS0MsUUFBUSxDQUFDLGVBQ2RELEtBQUtDLFFBQVEsQ0FBQztRQUdoQiw2QkFBNkI7UUFDN0IsSUFBSUMsZ0JBQWdCO1FBQ3BCLElBQUk7WUFDRixNQUFNLEVBQUVaLElBQUksRUFBRWEsS0FBSyxFQUFFLEdBQUcsTUFBTXBCLHFEQUFRQSxDQUFDUyxJQUFJLENBQUNZLGNBQWM7WUFDMURGLGdCQUFnQjtnQkFDZEcsU0FBUyxDQUFDRjtnQkFDVkcsWUFBWSxDQUFDLENBQUNoQixLQUFLRixPQUFPO2dCQUMxQm1CLFNBQVMsQ0FBQyxDQUFDakIsS0FBS0QsSUFBSTtnQkFDcEJjLE9BQU9BLFFBQVFBLE1BQU1LLE9BQU8sR0FBRztZQUNqQztZQUVBLElBQUksQ0FBQ0wsU0FBU2IsS0FBS0YsT0FBTyxFQUFFO2dCQUMxQkYsUUFBUUMsR0FBRyxDQUFDO1lBQ2QsT0FBTyxJQUFJZ0IsT0FBTztnQkFDaEJqQixRQUFRaUIsS0FBSyxDQUFDLDBCQUEwQkE7WUFDMUM7UUFDRixFQUFFLE9BQU9NLGNBQWM7WUFDckJ2QixRQUFRaUIsS0FBSyxDQUFDLDZCQUE2Qk07WUFDM0NQLGdCQUFnQjtnQkFDZEcsU0FBUztnQkFDVEYsT0FBTyxhQUF3QkssT0FBTztZQUN4QztRQUNGO1FBRUEsNkNBQTZDO1FBQzdDLE9BQU81QixxREFBWUEsQ0FBQzhCLElBQUksQ0FBQztZQUN2QkMsZUFBZSxDQUFDLENBQUN0QjtZQUNqQnVCLGVBQWUsQ0FBQyxDQUFDeEI7WUFDakJ5QixrQkFBa0IsQ0FBQyxDQUFDdEIsYUFBYUg7WUFDakNBLFNBQVNHLGFBQWFILFVBQVU7Z0JBQzlCMEIsV0FBV3ZCLFlBQVlILE9BQU8sQ0FBQzJCLFVBQVU7Z0JBQ3pDQyxnQkFBZ0IsQ0FBQyxDQUFDekIsWUFBWUgsT0FBTyxDQUFDNkIsWUFBWTtnQkFDbERDLG1CQUFtQjNCLFlBQVlILE9BQU8sQ0FBQzZCLFlBQVksRUFBRUUsVUFBVTtZQUNqRSxJQUFJO1lBQ0o5QixNQUFNQSxPQUFPO2dCQUNYK0IsSUFBSS9CLEtBQUsrQixFQUFFO2dCQUNYQyxPQUFPaEMsS0FBS2dDLEtBQUs7Z0JBQ2pCQyxnQkFBZ0IsQ0FBQyxDQUFDakMsS0FBS2tDLGtCQUFrQjtZQUMzQyxJQUFJO1lBQ0pDLGlCQUFpQjFCO1lBQ2pCMkIsWUFBWWhDO1lBQ1pTO1FBQ0Y7SUFDRixFQUFFLE9BQU9DLE9BQU87UUFDZGpCLFFBQVFpQixLQUFLLENBQUMscUJBQXFCQTtRQUNuQyxPQUFPdkIscURBQVlBLENBQUM4QixJQUFJLENBQUM7WUFDdkJMLFNBQVM7WUFDVEYsT0FBTztZQUNQdUIsU0FBUyxNQUFpQmxCLE9BQU87UUFDbkMsR0FBRztZQUFFbUIsUUFBUTtRQUFJO0lBQ25CO0FBQ0YiLCJzb3VyY2VzIjpbIi9Vc2Vycy9idXNpbmVzc2xhcHRvcC9Eb2N1bWVudHMvVXBzY2Fsb3JvL2Zyb250ZW5kL2FwcC9hcGkvYXV0aC1kZWJ1Zy9yb3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVxdWVzdCwgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInO1xuaW1wb3J0IHsgZ2V0U2Vzc2lvbiwgZ2V0Q3VycmVudFVzZXIsIHN1cGFiYXNlIH0gZnJvbSAnQC91dGlscy9zdXBhYmFzZSc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQocmVxdWVzdDogTmV4dFJlcXVlc3QpIHtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLmxvZyhcIkF1dGggZGVidWcgQVBJIGNhbGxlZFwiKTtcbiAgICBcbiAgICAvLyBHZXQgU3VwYWJhc2Ugc2Vzc2lvblxuICAgIGNvbnN0IHNlc3Npb24gPSBhd2FpdCBnZXRTZXNzaW9uKCk7XG4gICAgY29uc3QgdXNlciA9IGF3YWl0IGdldEN1cnJlbnRVc2VyKCk7XG4gICAgXG4gICAgLy8gR2V0IHNlc3Npb24gZGF0YSBkaXJlY3RseVxuICAgIGNvbnN0IHsgZGF0YTogc2Vzc2lvbkRhdGEgfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0U2Vzc2lvbigpO1xuICAgIFxuICAgIC8vIEV4dHJhY3QgY29va2llIG5hbWVzIGZyb20gdGhlIHJlcXVlc3RcbiAgICBjb25zdCBjb29raWVOYW1lcyA9IE9iamVjdC5rZXlzKHJlcXVlc3QuY29va2llcy5nZXRBbGwoKSk7XG4gICAgY29uc3Qgc3VwYWJhc2VDb29raWVOYW1lcyA9IGNvb2tpZU5hbWVzLmZpbHRlcihuYW1lID0+IFxuICAgICAgbmFtZS5pbmNsdWRlcygnc3VwYWJhc2UnKSB8fCBcbiAgICAgIG5hbWUuaW5jbHVkZXMoJ3NiLScpXG4gICAgKTtcbiAgICBcbiAgICAvLyBUcnkgdG8gcmVmcmVzaCB0aGUgc2Vzc2lvblxuICAgIGxldCByZWZyZXNoUmVzdWx0ID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5yZWZyZXNoU2Vzc2lvbigpO1xuICAgICAgcmVmcmVzaFJlc3VsdCA9IHtcbiAgICAgICAgc3VjY2VzczogIWVycm9yLFxuICAgICAgICBoYXNTZXNzaW9uOiAhIWRhdGEuc2Vzc2lvbixcbiAgICAgICAgaGFzVXNlcjogISFkYXRhLnVzZXIsXG4gICAgICAgIGVycm9yOiBlcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBudWxsXG4gICAgICB9O1xuICAgICAgXG4gICAgICBpZiAoIWVycm9yICYmIGRhdGEuc2Vzc2lvbikge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlNlc3Npb24gcmVmcmVzaGVkIHN1Y2Nlc3NmdWxseVwiKTtcbiAgICAgIH0gZWxzZSBpZiAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIlNlc3Npb24gcmVmcmVzaCBlcnJvcjpcIiwgZXJyb3IpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKHJlZnJlc2hFcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHJlZnJlc2hpbmcgc2Vzc2lvbjpcIiwgcmVmcmVzaEVycm9yKTtcbiAgICAgIHJlZnJlc2hSZXN1bHQgPSB7IFxuICAgICAgICBzdWNjZXNzOiBmYWxzZSwgXG4gICAgICAgIGVycm9yOiAocmVmcmVzaEVycm9yIGFzIEVycm9yKS5tZXNzYWdlIFxuICAgICAgfTtcbiAgICB9XG4gICAgXG4gICAgLy8gUmV0dXJuIGRldGFpbGVkIGF1dGhlbnRpY2F0aW9uIGluZm9ybWF0aW9uXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgIGF1dGhlbnRpY2F0ZWQ6ICEhdXNlcixcbiAgICAgIHNlc3Npb25FeGlzdHM6ICEhc2Vzc2lvbixcbiAgICAgIHJhd1Nlc3Npb25FeGlzdHM6ICEhc2Vzc2lvbkRhdGE/LnNlc3Npb24sXG4gICAgICBzZXNzaW9uOiBzZXNzaW9uRGF0YT8uc2Vzc2lvbiA/IHtcbiAgICAgICAgZXhwaXJlc0F0OiBzZXNzaW9uRGF0YS5zZXNzaW9uLmV4cGlyZXNfYXQsXG4gICAgICAgIGhhc0FjY2Vzc1Rva2VuOiAhIXNlc3Npb25EYXRhLnNlc3Npb24uYWNjZXNzX3Rva2VuLFxuICAgICAgICBhY2Nlc3NUb2tlbkxlbmd0aDogc2Vzc2lvbkRhdGEuc2Vzc2lvbi5hY2Nlc3NfdG9rZW4/Lmxlbmd0aCB8fCAwXG4gICAgICB9IDogbnVsbCxcbiAgICAgIHVzZXI6IHVzZXIgPyB7XG4gICAgICAgIGlkOiB1c2VyLmlkLFxuICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgICAgICAgZW1haWxDb25maXJtZWQ6ICEhdXNlci5lbWFpbF9jb25maXJtZWRfYXRcbiAgICAgIH0gOiBudWxsLFxuICAgICAgc3VwYWJhc2VDb29raWVzOiBzdXBhYmFzZUNvb2tpZU5hbWVzLFxuICAgICAgYWxsQ29va2llczogY29va2llTmFtZXMsXG4gICAgICByZWZyZXNoUmVzdWx0XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignQXV0aCBkZWJ1ZyBlcnJvcjonLCBlcnJvcik7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdFcnJvciBkZWJ1Z2dpbmcgYXV0aGVudGljYXRpb24nLFxuICAgICAgZGV0YWlsczogKGVycm9yIGFzIEVycm9yKS5tZXNzYWdlXG4gICAgfSwgeyBzdGF0dXM6IDUwMCB9KTtcbiAgfVxufSAiXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiZ2V0U2Vzc2lvbiIsImdldEN1cnJlbnRVc2VyIiwic3VwYWJhc2UiLCJHRVQiLCJyZXF1ZXN0IiwiY29uc29sZSIsImxvZyIsInNlc3Npb24iLCJ1c2VyIiwiZGF0YSIsInNlc3Npb25EYXRhIiwiYXV0aCIsImNvb2tpZU5hbWVzIiwiT2JqZWN0Iiwia2V5cyIsImNvb2tpZXMiLCJnZXRBbGwiLCJzdXBhYmFzZUNvb2tpZU5hbWVzIiwiZmlsdGVyIiwibmFtZSIsImluY2x1ZGVzIiwicmVmcmVzaFJlc3VsdCIsImVycm9yIiwicmVmcmVzaFNlc3Npb24iLCJzdWNjZXNzIiwiaGFzU2Vzc2lvbiIsImhhc1VzZXIiLCJtZXNzYWdlIiwicmVmcmVzaEVycm9yIiwianNvbiIsImF1dGhlbnRpY2F0ZWQiLCJzZXNzaW9uRXhpc3RzIiwicmF3U2Vzc2lvbkV4aXN0cyIsImV4cGlyZXNBdCIsImV4cGlyZXNfYXQiLCJoYXNBY2Nlc3NUb2tlbiIsImFjY2Vzc190b2tlbiIsImFjY2Vzc1Rva2VuTGVuZ3RoIiwibGVuZ3RoIiwiaWQiLCJlbWFpbCIsImVtYWlsQ29uZmlybWVkIiwiZW1haWxfY29uZmlybWVkX2F0Iiwic3VwYWJhc2VDb29raWVzIiwiYWxsQ29va2llcyIsImRldGFpbHMiLCJzdGF0dXMiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth-debug/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth-debug%2Froute&page=%2Fapi%2Fauth-debug%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth-debug%2Froute.ts&appDir=%2FUsers%2Fbusinesslaptop%2FDocuments%2FUpscaloro%2Ffrontend%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fbusinesslaptop%2FDocuments%2FUpscaloro%2Ffrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth-debug%2Froute&page=%2Fapi%2Fauth-debug%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth-debug%2Froute.ts&appDir=%2FUsers%2Fbusinesslaptop%2FDocuments%2FUpscaloro%2Ffrontend%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fbusinesslaptop%2FDocuments%2FUpscaloro%2Ffrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_businesslaptop_Documents_Upscaloro_frontend_app_api_auth_debug_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/auth-debug/route.ts */ \"(rsc)/./app/api/auth-debug/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth-debug/route\",\n        pathname: \"/api/auth-debug\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth-debug/route\"\n    },\n    resolvedPagePath: \"/Users/businesslaptop/Documents/Upscaloro/frontend/app/api/auth-debug/route.ts\",\n    nextConfigOutput,\n    userland: _Users_businesslaptop_Documents_Upscaloro_frontend_app_api_auth_debug_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoLWRlYnVnJTJGcm91dGUmcGFnZT0lMkZhcGklMkZhdXRoLWRlYnVnJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGYXV0aC1kZWJ1ZyUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRmJ1c2luZXNzbGFwdG9wJTJGRG9jdW1lbnRzJTJGVXBzY2Fsb3JvJTJGZnJvbnRlbmQlMkZhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPSUyRlVzZXJzJTJGYnVzaW5lc3NsYXB0b3AlMkZEb2N1bWVudHMlMkZVcHNjYWxvcm8lMkZmcm9udGVuZCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDOEI7QUFDM0c7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9Vc2Vycy9idXNpbmVzc2xhcHRvcC9Eb2N1bWVudHMvVXBzY2Fsb3JvL2Zyb250ZW5kL2FwcC9hcGkvYXV0aC1kZWJ1Zy9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvYXV0aC1kZWJ1Zy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2F1dGgtZGVidWdcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2F1dGgtZGVidWcvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvVXNlcnMvYnVzaW5lc3NsYXB0b3AvRG9jdW1lbnRzL1Vwc2NhbG9yby9mcm9udGVuZC9hcHAvYXBpL2F1dGgtZGVidWcvcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth-debug%2Froute&page=%2Fapi%2Fauth-debug%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth-debug%2Froute.ts&appDir=%2FUsers%2Fbusinesslaptop%2FDocuments%2FUpscaloro%2Ffrontend%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fbusinesslaptop%2FDocuments%2FUpscaloro%2Ffrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getCurrentUser: () => (/* binding */ getCurrentUser),\n/* harmony export */   getSession: () => (/* binding */ getSession),\n/* harmony export */   signIn: () => (/* binding */ signIn),\n/* harmony export */   signOut: () => (/* binding */ signOut),\n/* harmony export */   signUp: () => (/* binding */ signUp),\n/* harmony export */   supabase: () => (/* binding */ supabase)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n\nconst supabaseUrl = \"https://nvcnmsbwydecixpvnecy.supabase.co\" || 0;\nconst supabaseAnonKey = \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52Y25tc2J3eWRlY2l4cHZuZWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2ODgxMTksImV4cCI6MjA1NjI2NDExOX0.XP16GYF9ADll2LopFv1jT_QWoQC53pCSr0evsiTOqyQ\" || 0;\nif (!supabaseUrl || !supabaseAnonKey) {\n    console.error('Missing Supabase environment variables. Please check your .env file.');\n}\n// Create the Supabase client with persistence enabled and secure cookie options\nconst supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(supabaseUrl, supabaseAnonKey, {\n    auth: {\n        persistSession: true,\n        autoRefreshToken: true,\n        detectSessionInUrl: true,\n        storageKey: 'supabase.auth.token',\n        // Browser storage options\n        storage: {\n            getItem: (key)=>{\n                try {\n                    return localStorage.getItem(key);\n                } catch (error) {\n                    console.error('Error accessing localStorage:', error);\n                    return null;\n                }\n            },\n            setItem: (key, value)=>{\n                try {\n                    localStorage.setItem(key, value);\n                } catch (error) {\n                    console.error('Error writing to localStorage:', error);\n                }\n            },\n            removeItem: (key)=>{\n                try {\n                    localStorage.removeItem(key);\n                } catch (error) {\n                    console.error('Error removing from localStorage:', error);\n                }\n            }\n        }\n    }\n});\n// Authentication helper functions\nconst signUp = async (email, password)=>{\n    const { data, error } = await supabase.auth.signUp({\n        email,\n        password\n    });\n    return {\n        data,\n        error\n    };\n};\nconst signIn = async (email, password)=>{\n    const { data, error } = await supabase.auth.signInWithPassword({\n        email,\n        password\n    });\n    return {\n        data,\n        error\n    };\n};\nconst signOut = async ()=>{\n    const { error } = await supabase.auth.signOut();\n    return {\n        error\n    };\n};\nconst getCurrentUser = async ()=>{\n    try {\n        const { data: { user } } = await supabase.auth.getUser();\n        return user;\n    } catch (error) {\n        console.error('Error getting current user:', error);\n        return null;\n    }\n};\nconst getSession = async ()=>{\n    try {\n        const { data: { session } } = await supabase.auth.getSession();\n        return session;\n    } catch (error) {\n        console.error('Error getting session:', error);\n        return null;\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi91dGlscy9zdXBhYmFzZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQXFEO0FBRXJELE1BQU1DLGNBQWNDLDBDQUFvQyxJQUFJLENBQUU7QUFDOUQsTUFBTUcsa0JBQWtCSCxrTkFBeUMsSUFBSSxDQUFFO0FBRXZFLElBQUksQ0FBQ0QsZUFBZSxDQUFDSSxpQkFBaUI7SUFDcENFLFFBQVFDLEtBQUssQ0FBQztBQUNoQjtBQUVBLGdGQUFnRjtBQUN6RSxNQUFNQyxXQUFXVCxtRUFBWUEsQ0FBQ0MsYUFBYUksaUJBQWlCO0lBQ2pFSyxNQUFNO1FBQ0pDLGdCQUFnQjtRQUNoQkMsa0JBQWtCO1FBQ2xCQyxvQkFBb0I7UUFDcEJDLFlBQVk7UUFDWiwwQkFBMEI7UUFDMUJDLFNBQVM7WUFDUEMsU0FBUyxDQUFDQztnQkFDUixJQUFJO29CQUNGLE9BQU9DLGFBQWFGLE9BQU8sQ0FBQ0M7Z0JBQzlCLEVBQUUsT0FBT1QsT0FBTztvQkFDZEQsUUFBUUMsS0FBSyxDQUFDLGlDQUFpQ0E7b0JBQy9DLE9BQU87Z0JBQ1Q7WUFDRjtZQUNBVyxTQUFTLENBQUNGLEtBQUtHO2dCQUNiLElBQUk7b0JBQ0ZGLGFBQWFDLE9BQU8sQ0FBQ0YsS0FBS0c7Z0JBQzVCLEVBQUUsT0FBT1osT0FBTztvQkFDZEQsUUFBUUMsS0FBSyxDQUFDLGtDQUFrQ0E7Z0JBQ2xEO1lBQ0Y7WUFDQWEsWUFBWSxDQUFDSjtnQkFDWCxJQUFJO29CQUNGQyxhQUFhRyxVQUFVLENBQUNKO2dCQUMxQixFQUFFLE9BQU9ULE9BQU87b0JBQ2RELFFBQVFDLEtBQUssQ0FBQyxxQ0FBcUNBO2dCQUNyRDtZQUNGO1FBQ0Y7SUFDRjtBQUNGLEdBQUc7QUFFSCxrQ0FBa0M7QUFDM0IsTUFBTWMsU0FBUyxPQUFPQyxPQUFlQztJQUMxQyxNQUFNLEVBQUVDLElBQUksRUFBRWpCLEtBQUssRUFBRSxHQUFHLE1BQU1DLFNBQVNDLElBQUksQ0FBQ1ksTUFBTSxDQUFDO1FBQ2pEQztRQUNBQztJQUNGO0lBQ0EsT0FBTztRQUFFQztRQUFNakI7SUFBTTtBQUN2QixFQUFFO0FBRUssTUFBTWtCLFNBQVMsT0FBT0gsT0FBZUM7SUFDMUMsTUFBTSxFQUFFQyxJQUFJLEVBQUVqQixLQUFLLEVBQUUsR0FBRyxNQUFNQyxTQUFTQyxJQUFJLENBQUNpQixrQkFBa0IsQ0FBQztRQUM3REo7UUFDQUM7SUFDRjtJQUNBLE9BQU87UUFBRUM7UUFBTWpCO0lBQU07QUFDdkIsRUFBRTtBQUVLLE1BQU1vQixVQUFVO0lBQ3JCLE1BQU0sRUFBRXBCLEtBQUssRUFBRSxHQUFHLE1BQU1DLFNBQVNDLElBQUksQ0FBQ2tCLE9BQU87SUFDN0MsT0FBTztRQUFFcEI7SUFBTTtBQUNqQixFQUFFO0FBRUssTUFBTXFCLGlCQUFpQjtJQUM1QixJQUFJO1FBQ0YsTUFBTSxFQUFFSixNQUFNLEVBQUVLLElBQUksRUFBRSxFQUFFLEdBQUcsTUFBTXJCLFNBQVNDLElBQUksQ0FBQ3FCLE9BQU87UUFDdEQsT0FBT0Q7SUFDVCxFQUFFLE9BQU90QixPQUFPO1FBQ2RELFFBQVFDLEtBQUssQ0FBQywrQkFBK0JBO1FBQzdDLE9BQU87SUFDVDtBQUNGLEVBQUU7QUFFSyxNQUFNd0IsYUFBYTtJQUN4QixJQUFJO1FBQ0YsTUFBTSxFQUFFUCxNQUFNLEVBQUVRLE9BQU8sRUFBRSxFQUFFLEdBQUcsTUFBTXhCLFNBQVNDLElBQUksQ0FBQ3NCLFVBQVU7UUFDNUQsT0FBT0M7SUFDVCxFQUFFLE9BQU96QixPQUFPO1FBQ2RELFFBQVFDLEtBQUssQ0FBQywwQkFBMEJBO1FBQ3hDLE9BQU87SUFDVDtBQUNGLEVBQUUiLCJzb3VyY2VzIjpbIi9Vc2Vycy9idXNpbmVzc2xhcHRvcC9Eb2N1bWVudHMvVXBzY2Fsb3JvL2Zyb250ZW5kL3V0aWxzL3N1cGFiYXNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyc7XG5cbmNvbnN0IHN1cGFiYXNlVXJsID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIHx8ICcnO1xuY29uc3Qgc3VwYWJhc2VBbm9uS2V5ID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkgfHwgJyc7XG5cbmlmICghc3VwYWJhc2VVcmwgfHwgIXN1cGFiYXNlQW5vbktleSkge1xuICBjb25zb2xlLmVycm9yKCdNaXNzaW5nIFN1cGFiYXNlIGVudmlyb25tZW50IHZhcmlhYmxlcy4gUGxlYXNlIGNoZWNrIHlvdXIgLmVudiBmaWxlLicpO1xufVxuXG4vLyBDcmVhdGUgdGhlIFN1cGFiYXNlIGNsaWVudCB3aXRoIHBlcnNpc3RlbmNlIGVuYWJsZWQgYW5kIHNlY3VyZSBjb29raWUgb3B0aW9uc1xuZXhwb3J0IGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KHN1cGFiYXNlVXJsLCBzdXBhYmFzZUFub25LZXksIHtcbiAgYXV0aDoge1xuICAgIHBlcnNpc3RTZXNzaW9uOiB0cnVlLFxuICAgIGF1dG9SZWZyZXNoVG9rZW46IHRydWUsXG4gICAgZGV0ZWN0U2Vzc2lvbkluVXJsOiB0cnVlLFxuICAgIHN0b3JhZ2VLZXk6ICdzdXBhYmFzZS5hdXRoLnRva2VuJyxcbiAgICAvLyBCcm93c2VyIHN0b3JhZ2Ugb3B0aW9uc1xuICAgIHN0b3JhZ2U6IHtcbiAgICAgIGdldEl0ZW06IChrZXkpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhY2Nlc3NpbmcgbG9jYWxTdG9yYWdlOicsIGVycm9yKTtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHNldEl0ZW06IChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCB2YWx1ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igd3JpdGluZyB0byBsb2NhbFN0b3JhZ2U6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgcmVtb3ZlSXRlbTogKGtleSkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgcmVtb3ZpbmcgZnJvbSBsb2NhbFN0b3JhZ2U6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59KTtcblxuLy8gQXV0aGVudGljYXRpb24gaGVscGVyIGZ1bmN0aW9uc1xuZXhwb3J0IGNvbnN0IHNpZ25VcCA9IGFzeW5jIChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguc2lnblVwKHtcbiAgICBlbWFpbCxcbiAgICBwYXNzd29yZCxcbiAgfSk7XG4gIHJldHVybiB7IGRhdGEsIGVycm9yIH07XG59O1xuXG5leHBvcnQgY29uc3Qgc2lnbkluID0gYXN5bmMgKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpID0+IHtcbiAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5zaWduSW5XaXRoUGFzc3dvcmQoe1xuICAgIGVtYWlsLFxuICAgIHBhc3N3b3JkLFxuICB9KTtcbiAgcmV0dXJuIHsgZGF0YSwgZXJyb3IgfTtcbn07XG5cbmV4cG9ydCBjb25zdCBzaWduT3V0ID0gYXN5bmMgKCkgPT4ge1xuICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLnNpZ25PdXQoKTtcbiAgcmV0dXJuIHsgZXJyb3IgfTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRDdXJyZW50VXNlciA9IGFzeW5jICgpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKTtcbiAgICByZXR1cm4gdXNlcjtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGN1cnJlbnQgdXNlcjonLCBlcnJvcik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBnZXRTZXNzaW9uID0gYXN5bmMgKCkgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHsgZGF0YTogeyBzZXNzaW9uIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0U2Vzc2lvbigpO1xuICAgIHJldHVybiBzZXNzaW9uO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgc2Vzc2lvbjonLCBlcnJvcik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn07ICJdLCJuYW1lcyI6WyJjcmVhdGVDbGllbnQiLCJzdXBhYmFzZVVybCIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwiLCJzdXBhYmFzZUFub25LZXkiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWSIsImNvbnNvbGUiLCJlcnJvciIsInN1cGFiYXNlIiwiYXV0aCIsInBlcnNpc3RTZXNzaW9uIiwiYXV0b1JlZnJlc2hUb2tlbiIsImRldGVjdFNlc3Npb25JblVybCIsInN0b3JhZ2VLZXkiLCJzdG9yYWdlIiwiZ2V0SXRlbSIsImtleSIsImxvY2FsU3RvcmFnZSIsInNldEl0ZW0iLCJ2YWx1ZSIsInJlbW92ZUl0ZW0iLCJzaWduVXAiLCJlbWFpbCIsInBhc3N3b3JkIiwiZGF0YSIsInNpZ25JbiIsInNpZ25JbldpdGhQYXNzd29yZCIsInNpZ25PdXQiLCJnZXRDdXJyZW50VXNlciIsInVzZXIiLCJnZXRVc2VyIiwiZ2V0U2Vzc2lvbiIsInNlc3Npb24iXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./utils/supabase.ts\n");

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

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth-debug%2Froute&page=%2Fapi%2Fauth-debug%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth-debug%2Froute.ts&appDir=%2FUsers%2Fbusinesslaptop%2FDocuments%2FUpscaloro%2Ffrontend%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fbusinesslaptop%2FDocuments%2FUpscaloro%2Ffrontend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();